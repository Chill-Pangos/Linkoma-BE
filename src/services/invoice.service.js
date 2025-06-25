const { 
  Invoice, 
  InvoiceDetail, 
  ServiceRegistration, 
  ServiceType, 
  Apartment, 
  ApartmentType 
} = require("../models");
const invoiceFieldConfig = require("../config/fieldConfig/invoice.fieldconfig");
const apiError = require("../utils/apiError");
const httpStatus= require("http-status");
const { Op } = require("sequelize");
const filterValidFields = require("../utils/filterValidFields");
const dayjs = require("dayjs");

/**
 * @description Create a new invoice in the database
 *
 * @param {Object} invoiceData - The invoice data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 * */

/**
 * @description Create a new invoice with invoice details based on service registrations
 *
 * @param {Object} invoiceData - The invoice data including apartmentId, rentFee, dueDate, serviceUsages
 * @return {Object} - The result of the invoice creation with details
 * @throws {apiError} - If there is an error during the creation
 */
const createInvoiceWithDetails = async (invoiceData) => {
  const transaction = await Invoice.sequelize.transaction();
  
  try {
    const { apartmentId, serviceUsages } = invoiceData;

    // Auto generate dueDate as 7 days from now
    const dueDate = dayjs().add(7, 'day').format('YYYY-MM-DD');

    // Validate apartment exists
    const apartment = await Apartment.findByPk(apartmentId, {
      include: [{
        model: ApartmentType,
        as: 'apartmentType',
        attributes: ['rentFee', 'area', 'typeName']
      }]
    });
    
    if (!apartment) {
      throw new apiError(404, "Apartment not found");
    }

    // Get active service registrations for the apartment
    const serviceRegistrations = await ServiceRegistration.findAll({
      where: {
        apartmentId,
        status: 'Active',
      },
      include: [{
        model: ServiceType,
        as: 'serviceType',
        attributes: ['serviceTypeId', 'serviceName', 'unit', 'unitPrice']
      }]
    });

    if (serviceRegistrations.length === 0) {
      throw new apiError(400, "No active service registrations found for this apartment");
    }

    // Validate that all provided serviceUsages are registered for the apartment
    for (const usage of serviceUsages) {
      const isRegistered = serviceRegistrations.some(reg => 
        reg.serviceTypeId === usage.serviceTypeId
      );
      
      if (!isRegistered) {
        throw new apiError(
          400, 
          `Service type ${usage.serviceTypeId} is not registered for this apartment`
        );
      }
    }

    // Calculate service fee from provided usages
    let totalServiceFee = 0;
    const invoiceDetails = [];

    for (const usage of serviceUsages) {
      const registration = serviceRegistrations.find(reg => 
        reg.serviceTypeId === usage.serviceTypeId
      );

      const serviceType = registration.serviceType;
      const totalAmount = usage.usage * parseFloat(serviceType.unitPrice);
      totalServiceFee += totalAmount;

      invoiceDetails.push({
        serviceTypeId: usage.serviceTypeId,
        usage: usage.usage,
        totalAmount: totalAmount
      });
    }

    // Get rent fee from apartment type
    const rentFee = apartment.apartmentType?.rentFee || 0;
    
    if (!apartment.apartmentType || rentFee === 0) {
      throw new apiError(400, "Apartment type or rent fee not found");
    }

    // Create invoice
    const invoice = await Invoice.create({
      apartmentId,
      rentFee: rentFee,
      serviceFee: totalServiceFee,
      dueDate,
      status: 'Unpaid'
    }, { transaction });

    // Create invoice details
    for (const detail of invoiceDetails) {
      await InvoiceDetail.create({
        invoiceId: invoice.invoiceId,
        ...detail
      }, { transaction });
    }

    await transaction.commit();

    return {
      message: "Invoice with details created successfully",
      invoiceId: invoice.invoiceId,
      dueDate: dueDate,
      rentFee: rentFee,
      serviceFee: totalServiceFee,
      totalAmount: rentFee + totalServiceFee,
      invoiceDetailsCount: invoiceDetails.length,
      serviceDetails: invoiceDetails.map(detail => {
        const registration = serviceRegistrations.find(reg => 
          reg.serviceTypeId === detail.serviceTypeId
        );
        return {
          serviceName: registration.serviceType.serviceName,
          unit: registration.serviceType.unit,
          unitPrice: registration.serviceType.unitPrice,
          usage: detail.usage,
          totalAmount: detail.totalAmount
        };
      })
    };
  } catch (error) {
    await transaction.rollback();
    throw new apiError(500, error.message);
  }
};

const createInvoice = async (invoiceData) => {
  try {
    // Auto generate dueDate as 7 days from now if not provided
    if (!invoiceData.dueDate) {
      invoiceData.dueDate = dayjs().add(7, 'day').format('YYYY-MM-DD');
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceData,
      invoiceFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    const result = await Invoice.create(fields);

    if (!result) {
      throw new apiError(
        500,
        "Invoice creation failed"
      );
    }

    return {
      message: "Invoice created successfully",
      invoiceId: result.invoiceId,
      dueDate: result.dueDate,
      rentFee: result.rentFee,
      serviceFee: result.serviceFee,
      totalAmount: (result.rentFee || 0) + (result.serviceFee || 0),
      status: result.status
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get an invoice by Id
 * @param {number} invoiceId - The Id of the invoice to be retrieved
 * @return {Object} - The invoice data
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getInvoiceById = async (invoiceId) => {
  try {
    if (!invoiceId) {
      throw new apiError(400, "Invoice Id is required");
    }

    const invoice = await Invoice.findByPk(invoiceId, {
      include: [
        {
          model: Apartment,
          as: 'apartment',
          attributes: ['apartmentId', 'floor'],
          include: [{
            model: ApartmentType,
            as: 'apartmentType',
            attributes: ['typeName', 'rentFee', 'area']
          }]
        },
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          include: [{
            model: ServiceType,
            as: 'serviceType',
            attributes: ['serviceName', 'unit', 'unitPrice']
          }]
        }
      ]
    });

    if (!invoice) {
      throw new apiError(404, "Invoice not found");
    }

    return invoice;
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get all invoices with pagination
 * @param {number} limit - The number of invoices to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Array} - An array of invoice data
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getInvoices = async (limit, offset) => {
  try {
    const invoices = await Invoice.findAll({
      limit: limit,
      offset: offset,
      order: [['createdAt', 'ASC']],
      include: [{
        model: Apartment,
        as: 'apartment',
        attributes: ['apartmentId', 'floor']
      }]
    });

    const totalCount = await Invoice.count();

    return {
      data: invoices,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.ceil(offset / limit) + 1,
      totalCount: totalCount
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Update an invoice by Id
 * @param {number} invoiceId - The Id of the invoice to be updated
 * @param {Object} invoiceData - The updated invoice data
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 * */

const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    if (!invoiceId) {
      throw new apiError(400, "Invoice Id is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceData,
      invoiceFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    const [affectedRows] = await Invoice.update(fields, {
      where: { invoiceId: invoiceId }
    });

    if (affectedRows === 0) {
      throw new apiError(404, "Invoice not found");
    }

    return {
      message: "Invoice updated successfully",
      invoiceId: invoiceId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Delete an invoice by Id
 * @param {number} invoiceId - The Id of the invoice to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 * */

const deleteInvoice = async (invoiceId) => {
  try {
    if (!invoiceId) {
      throw new apiError(400, "Invoice Id is required");
    }

    const affectedRows = await Invoice.destroy({
      where: { invoiceId: invoiceId }
    });

    if (affectedRows === 0) {
      throw new apiError(404, "Invoice not found");
    }

    return {
      message: "Invoice deleted successfully",
      invoiceId: invoiceId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Query invoices with filtering and pagination
 * @param {Object} filter - Filter object
 * @param {Object} options - Options object with sortBy, limit, page
 * @return {Object} - Paginated invoices with total count
 * @throws {apiError} - If there is an error during the query
 */
const queryInvoices = async (filter, options) => {
  try {
    const { apartmentId, status, minRentFee, maxRentFee, minServiceFee, maxServiceFee, dueDate } = filter;
    const { sortBy, limit = 10, page = 1 } = options;

    // Build where clause
    const where = {};
    if (apartmentId) where.apartmentId = apartmentId;
    if (status) where.status = status;
    if (minRentFee || maxRentFee) {
      where.rentFee = {};
      if (minRentFee) where.rentFee[Op.gte] = minRentFee;
      if (maxRentFee) where.rentFee[Op.lte] = maxRentFee;
    }
    if (minServiceFee || maxServiceFee) {
      where.serviceFee = {};
      if (minServiceFee) where.serviceFee[Op.gte] = minServiceFee;
      if (maxServiceFee) where.serviceFee[Op.lte] = maxServiceFee;
    }
    if (dueDate) where.dueDate = dueDate;

    // Build order clause
    let order = [];
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      order = [[field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];
    } else {
      order = [['createdAt', 'DESC']];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{
        model: Apartment,
        as: 'apartment',
        attributes: ['apartmentId', 'floor']
      }]
    });

    const totalPages = Math.ceil(count / limit);

    return {
      results: rows,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      totalResults: count,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

module.exports = {
  createInvoice,
  createInvoiceWithDetails,
  getInvoiceById,
  getInvoices,
  queryInvoices,
  updateInvoice,
  deleteInvoice,
};
