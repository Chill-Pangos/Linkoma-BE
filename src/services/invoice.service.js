const db = require("../config/database");
const invoiceFieldConfig = require("../config/fieldConfig/invoice.fieldconfig");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new invoice in the database
 *
 * @param {Object} invoiceData - The invoice data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 * */

const CreateInvoice = async (invoiceData) => {
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceData,
      invoiceFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO invoice (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Invoice creation failed"
      );
    }

    return {
      message: "Invoice created successfully",
      invoiceId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get an invoice by ID
 * @param {number} invoiceId - The ID of the invoice to be retrieved
 * @return {Object} - The invoice data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const GetInvoiceById = async (invoiceId) => {
  const connection = await db.getConnection();

  try {
    if (!invoiceId) {
      throw new ApiError(status.BAD_REQUEST, "Invoice ID is required");
    }

    const query = `SELECT * FROM invoice WHERE invoiceID = ?`;
    const [rows] = await connection.execute(query, [invoiceId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Invoice not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get all invoices with pagination
 * @param {number} limit - The number of invoices to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Array} - An array of invoice data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const GetInvoices = async (limit, offset) => {
  const connection = await db.getConnection();

  try {
    const query = `SELECT * FROM invoice ORDER BY createdAt LIMIT ? OFFSET ?`;
    const [rows] = await connection.execute(query, [limit, offset]);

    return rows;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Update an invoice by ID
 * @param {number} invoiceId - The ID of the invoice to be updated
 * @param {Object} invoiceData - The updated invoice data
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 * */

const UpdateInvoice = async (invoiceId, invoiceData) => {
  const connection = await db.getConnection();

  try {
    if (!invoiceId) {
      throw new ApiError(status.BAD_REQUEST, "Invoice ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      invoiceData,
      invoiceFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `UPDATE invoice SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE invoiceID = ?`;

    const values = [...entries.map(([_, value]) => value), invoiceId];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Invoice not found");
    }

    return {
      message: "Invoice updated successfully",
      invoiceId: invoiceId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete an invoice by ID
 * @param {number} invoiceId - The ID of the invoice to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const DeleteInvoice = async (invoiceId) => {
  const connection = await db.getConnection();

  try {
    if (!invoiceId) {
      throw new ApiError(status.BAD_REQUEST, "Invoice ID is required");
    }

    const query = `DELETE FROM invoice WHERE invoiceID = ?`;
    const [result] = await connection.execute(query, [invoiceId]);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Invoice not found");
    }

    return {
      message: "Invoice deleted successfully",
      invoiceId: invoiceId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  CreateInvoice,
  GetInvoiceById,
  GetInvoices,
  UpdateInvoice,
  DeleteInvoice,
};
