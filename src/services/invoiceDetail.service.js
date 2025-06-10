const InvoiceDetail = require("../models/invoiceDetail.model");
const ServiceType = require("../models/serviceType.model");
const Invoice = require("../models/invoice.model");
const invoiceDetailFieldConfig = require("../config/fieldConfig/invoiceDetail.fieldconfig");
const apiError = require("../utils/apiError");
const httpStatus= require("http-status");
const { Op } = require("sequelize");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new invoice detail in the database
 *
 * @param {Object} invoiceDetailData - The invoice detail data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 * */

const createInvoiceDetail = async (invoiceDetailData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceDetailData,
      invoiceDetailFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    const result = await InvoiceDetail.create(fields);

    if (!result) {
      throw new apiError(
        500,
        "Invoice detail creation failed"
      );
    }

    return {
      message: "Invoice detail created successfully",
      invoiceDetailId: result.invoiceDetailId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get an invoice detail by Id
 * @param {number} invoiceDetailId - The Id of the invoice detail to be retrieved
 * @return {Object} - The invoice detail data
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getInvoiceDetailById = async (invoiceDetailId) => {
  try {
    const invoiceDetail = await InvoiceDetail.findByPk(invoiceDetailId);

    if (!invoiceDetail) {
      throw new apiError(404, "Invoice detail not found");
    }

    return invoiceDetail;
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get all invoice details of a specific invoice by invoice Id
 *
 * @param {number} invoiceId - The Id of the invoice to get details for
 * @return {Array} - An array of all invoice details
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getInvoiceDetailsByInvoiceId = async (invoiceId) => {
  try {
    if (!invoiceId) {
      throw new apiError(400, "Invoice Id is required");
    }

    const invoiceDetails = await InvoiceDetail.findAll({
      where: { invoiceId: invoiceId }
    });

    if (invoiceDetails.length === 0) {
      throw new apiError(404, "Invoice detail not found");
    }

    return invoiceDetails;
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

const updateInvoiceDetail = async (invoiceDetailId, invoiceDetailData) => {
    try {
        if (!invoiceDetailId) {
        throw new apiError(400, "Invoice detail Id is required");
        }

        const fields = filterValidFields.filterValidFieldsFromObject(
        invoiceDetailData,
        invoiceDetailFieldConfig.updatableFields
        );
    
        const entries = Object.entries(fields);
    
        if (entries.length === 0) {
        throw new apiError(400, "No valid fields provided");
        }
    
        const [affectedRows] = await InvoiceDetail.update(fields, {
            where: { invoiceDetailId: invoiceDetailId }
        });
    
        if (affectedRows === 0) {
        throw new apiError(404, "Invoice detail not found");
        }
    
        return {
        message: "Invoice detail updated successfully",
        };
    } catch (error) {
        throw new apiError(500, error.message);
    }
}

/**
 * @description Delete an invoice detail by Id
 * @param {number} invoiceDetailId - The Id of the invoice detail to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 * */

const deleteInvoiceDetail = async (invoiceDetailId) => {
    try {
        if (!invoiceDetailId) {
        throw new apiError(400, "Invoice detail Id is required");
        }
    
        const affectedRows = await InvoiceDetail.destroy({
            where: { invoiceDetailId: invoiceDetailId }
        });
    
        if (affectedRows === 0) {
        throw new apiError(404, "Invoice detail not found");
        }
    
        return {
        message: "Invoice detail deleted successfully",
        };
    } catch (error) {
        throw new apiError(500, error.message);
    }
}

/**
 * @description Query invoice details with filtering and pagination
 * @param {Object} filter - Filter object
 * @param {Object} options - Options object with sortBy, limit, page
 * @return {Object} - Paginated invoice details with total count
 * @throws {apiError} - If there is an error during the query
 */
const queryInvoiceDetails = async (filter, options) => {
  try {
    const { invoiceId, serviceTypeId, minUsage, maxUsage, minTotalAmount, maxTotalAmount } = filter;
    const { sortBy, limit = 10, page = 1 } = options;

    // Build where clause
    const where = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (serviceTypeId) where.serviceTypeId = serviceTypeId;
    if (minUsage || maxUsage) {
      where.usage = {};
      if (minUsage) where.usage[Op.gte] = minUsage;
      if (maxUsage) where.usage[Op.lte] = maxUsage;
    }
    if (minTotalAmount || maxTotalAmount) {
      where.totalAmount = {};
      if (minTotalAmount) where.totalAmount[Op.gte] = minTotalAmount;
      if (maxTotalAmount) where.totalAmount[Op.lte] = maxTotalAmount;
    }

    // Build order clause
    let order = [];
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      order = [[field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];
    } else {
      order = [['createdAt', 'DESC']];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await InvoiceDetail.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{
        model: ServiceType,
        attributes: ['serviceName', 'unit', 'unitPrice']
      }, {
        model: Invoice,
        attributes: ['invoiceId', 'apartmentId', 'status', 'dueDate']
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
  createInvoiceDetail,
  getInvoiceDetailById,
  getInvoiceDetailsByInvoiceId,
  updateInvoiceDetail,
  deleteInvoiceDetail,
  queryInvoiceDetails,
};
