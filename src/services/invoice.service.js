const Invoice = require("../models/invoice.model");
const InvoiceDetail = require("../models/invoiceDetail.model");
const ServiceRegistration = require("../models/serviceRegistration.model");
const ServiceType = require("../models/serviceType.model");
const Apartment = require("../models/apartment.model");
const invoiceFieldConfig = require("../config/fieldConfig/invoice.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const { Op } = require("sequelize");
const filterValidFields = require("../utils/filterValidFields");

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
    const { apartmentId, rentFee, dueDate, serviceUsages = [] } = invoiceData;

    // Validate apartment exists
    const apartment = await Apartment.findByPk(apartmentId);
    if (!apartment) {
      throw new apiError(status.NOT_FOUND, "Apartment not found");
    }

    // Get active service registrations for the apartment
    const serviceRegistrations = await ServiceRegistration.findAll({
      where: {
        apartmentId,
        status: 'Active'
      },
      include: [{
        model: ServiceType,
        attributes: ['serviceTypeId', 'serviceName', 'unit', 'unitPrice']
      }]
    });

    // Calculate service fee from provided usages
    let totalServiceFee = 0;
    const invoiceDetails = [];

    for (const usage of serviceUsages) {
      const registration = serviceRegistrations.find(reg => 
        reg.serviceTypeId === usage.serviceTypeId
      );

      if (!registration) {
        throw new apiError(
          status.BAD_REQUEST, 
          `Service type ${usage.serviceTypeId} is not registered for this apartment`
        );
      }

      const serviceType = registration.ServiceType;
      const totalAmount = usage.usage * serviceType.unitPrice;
      totalServiceFee += totalAmount;

      invoiceDetails.push({
        serviceTypeId: usage.serviceTypeId,
        usage: usage.usage,
        totalAmount
      });
    }

    // Create invoice
    const invoice = await Invoice.create({
      apartmentId,
      rentFee: rentFee || apartment.rentFee || 0,
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
      totalServiceFee,
      invoiceDetailsCount: invoiceDetails.length
    };
  } catch (error) {
    await transaction.rollback();
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const createInvoice = async (invoiceData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceData,
      invoiceFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const result = await Invoice.create(fields);

    if (!result) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Invoice creation failed"
      );
    }

    return {
      message: "Invoice created successfully",
      invoiceId: result.invoiceId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
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
      throw new apiError(status.BAD_REQUEST, "Invoice Id is required");
    }

    const invoice = await Invoice.findByPk(invoiceId);

    if (!invoice) {
      throw new apiError(status.NOT_FOUND, "Invoice not found");
    }

    return invoice;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
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
      order: [['createdAt', 'ASC']]
    });

    return invoices;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
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
      throw new apiError(status.BAD_REQUEST, "Invoice Id is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceData,
      invoiceFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await Invoice.update(fields, {
      where: { invoiceId: invoiceId }
    });

    if (affectedRows === 0) {
      throw new apiError(status.NOT_FOUND, "Invoice not found");
    }

    return {
      message: "Invoice updated successfully",
      invoiceId: invoiceId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
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
      throw new apiError(status.BAD_REQUEST, "Invoice Id is required");
    }

    const affectedRows = await Invoice.destroy({
      where: { invoiceId: invoiceId }
    });

    if (affectedRows === 0) {
      throw new apiError(status.NOT_FOUND, "Invoice not found");
    }

    return {
      message: "Invoice deleted successfully",
      invoiceId: invoiceId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
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
        attributes: ['apartmentNumber', 'floor', 'building']
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
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
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
