const InvoiceDetail = require("../models/invoiceDetail.model");
const invoiceDetailFieldConfig = require("../config/fieldConfig/invoiceDetail.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
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
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const result = await InvoiceDetail.create(fields);

    if (!result) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Invoice detail creation failed"
      );
    }

    return {
      message: "Invoice detail created successfully",
      invoiceDetailId: result.invoiceDetailID,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get an invoice detail by ID
 * @param {number} invoiceDetailId - The ID of the invoice detail to be retrieved
 * @return {Object} - The invoice detail data
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getInvoiceDetailById = async (invoiceDetailId) => {
  try {
    const invoiceDetail = await InvoiceDetail.findByPk(invoiceDetailId);

    if (!invoiceDetail) {
      throw new apiError(status.NOT_FOUND, "Invoice detail not found");
    }

    return invoiceDetail;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all invoice details of a specific invoice by invoice ID
 *
 * @param {number} invoiceId - The ID of the invoice to get details for
 * @return {Array} - An array of all invoice details
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getInvoiceDetailsByInvoiceId = async (invoiceId) => {
  try {
    if (!invoiceId) {
      throw new apiError(status.BAD_REQUEST, "Invoice ID is required");
    }

    const invoiceDetails = await InvoiceDetail.findAll({
      where: { invoiceID: invoiceId }
    });

    if (invoiceDetails.length === 0) {
      throw new apiError(status.NOT_FOUND, "Invoice detail not found");
    }

    return invoiceDetails;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateInvoiceDetail = async (invoiceDetailId, invoiceDetailData) => {
    try {
        if (!invoiceDetailId) {
        throw new apiError(status.BAD_REQUEST, "Invoice detail ID is required");
        }

        const fields = filterValidFields.filterValidFieldsFromObject(
        invoiceDetailData,
        invoiceDetailFieldConfig.updatableFields
        );
    
        const entries = Object.entries(fields);
    
        if (entries.length === 0) {
        throw new apiError(status.BAD_REQUEST, "No valid fields provided");
        }
    
        const [affectedRows] = await InvoiceDetail.update(fields, {
            where: { invoiceDetailID: invoiceDetailId }
        });
    
        if (affectedRows === 0) {
        throw new apiError(status.NOT_FOUND, "Invoice detail not found");
        }
    
        return {
        message: "Invoice detail updated successfully",
        };
    } catch (error) {
        throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
    }
}

/**
 * @description Delete an invoice detail by ID
 * @param {number} invoiceDetailId - The ID of the invoice detail to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 * */

const deleteInvoiceDetail = async (invoiceDetailId) => {
    try {
        if (!invoiceDetailId) {
        throw new apiError(status.BAD_REQUEST, "Invoice detail ID is required");
        }
    
        const affectedRows = await InvoiceDetail.destroy({
            where: { invoiceDetailID: invoiceDetailId }
        });
    
        if (affectedRows === 0) {
        throw new apiError(status.NOT_FOUND, "Invoice detail not found");
        }
    
        return {
        message: "Invoice detail deleted successfully",
        };
    } catch (error) {
        throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
  createInvoiceDetail,
  getInvoiceDetailById,
  getInvoiceDetailsByInvoiceId,
  updateInvoiceDetail,
  deleteInvoiceDetail,
};
