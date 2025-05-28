const db = require("../config/database");
const invoiceDetailFieldConfig = require("../config/fieldConfig/invoiceDetail.fieldconfig");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new invoice detail in the database
 *
 * @param {Object} invoiceDetailData - The invoice detail data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 * */

const createInvoiceDetail = async (invoiceDetailData) => {
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceDetailData,
      invoiceDetailFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO invoicedetail (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Invoice detail creation failed"
      );
    }

    return {
      message: "Invoice detail created successfully",
      invoiceDetailId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get an invoice detail by ID
 * @param {number} invoiceDetailId - The ID of the invoice detail to be retrieved
 * @return {Object} - The invoice detail data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getInvoiceDetailById = async (invoiceDetailId) => {
  const connection = await db.getConnection();

  try {
    const query = `SELECT * FROM invoicedetail WHERE invoiceDetailID = ?`;
    const [rows] = await connection.execute(query, [invoiceDetailId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Invoice detail not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get all invoice details of a specific invoice by invoice ID
 *
 * @param {number} invoiceId - The ID of the invoice to get details for
 * @return {Array} - An array of all invoice details
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getInvoiceDetailsByInvoiceId = async (invoiceId) => {
  const connection = await db.getConnection();

  try {
    if (!invoiceId) {
      throw new ApiError(status.BAD_REQUEST, "Invoice ID is required");
    }

    const query = `SELECT * FROM invoicedetail WHERE invoiceID = ?`;
    const [rows] = await connection.execute(query, [invoiceId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Invoice detail not found");
    }

    return rows;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

const updateInvoiceDetail = async (invoiceDetailId, invoiceDetailData) => {
    const connection = await db.getConnection();
    
    try {
        if (!invoiceDetailId) {
        throw new ApiError(status.BAD_REQUEST, "Invoice detail ID is required");
        }

        const fields = filterValidFields.filterValidFieldsFromObject(
        invoiceDetailData,
        invoiceDetailFieldConfig.updatableFields
        );
    
        const entries = Object.entries(fields);
    
        if (entries.length === 0) {
        throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
        }
    
        const query = `UPDATE invoicedetail SET ${entries
        .map(([key]) => `${key} = ?`)
        .join(", ")} WHERE invoiceDetailID = ?`;
    
        const values = [...entries.map(([_, value]) => value), invoiceDetailId];
    
        const [result] = await connection.execute(query, values);
    
        if (result.affectedRows === 0) {
        throw new ApiError(status.NOT_FOUND, "Invoice detail not found");
        }
    
        return {
        message: "Invoice detail updated successfully",
        };
    } catch (error) {
        throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
    } finally {
        connection.release();
    }
}

/**
 * @description Delete an invoice detail by ID
 * @param {number} invoiceDetailId - The ID of the invoice detail to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const deleteInvoiceDetail = async (invoiceDetailId) => {
    const connection = await db.getConnection();
    
    try {
        if (!invoiceDetailId) {
        throw new ApiError(status.BAD_REQUEST, "Invoice detail ID is required");
        }
    
        const query = `DELETE FROM invoicedetail WHERE invoiceDetailID = ?`;
        const [result] = await connection.execute(query, [invoiceDetailId]);
    
        if (result.affectedRows === 0) {
        throw new ApiError(status.NOT_FOUND, "Invoice detail not found");
        }
    
        return {
        message: "Invoice detail deleted successfully",
        };
    } catch (error) {
        throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
    } finally {
        connection.release();
    }
}

module.exports = {
  createInvoiceDetail,
  getInvoiceDetailById,
  getInvoiceDetailsByInvoiceId,
  updateInvoiceDetail,
  deleteInvoiceDetail,
};