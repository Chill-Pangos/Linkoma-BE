const Invoice = require("../models/invoice.model");
const invoiceFieldConfig = require("../config/fieldConfig/invoice.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new invoice in the database
 *
 * @param {Object} invoiceData - The invoice data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 * */

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

module.exports = {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
  deleteInvoice,
};
