const Joi = require("joi");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");

/**
 * @description Middleware to validate request data against a Joi schema.
 * @param {Object} schema - The Joi schema to validate against.
 * @returns {Function} - Express middleware function.
 * @throws {ApiError} - Throws an error if validation fails.
 */

const validate = (schema) => (req, res, next) => {
  const validParts = ["body", "query", "params", "cookies"];

  for (const part of validParts) {
    if (schema[part]) {
      const { error } = schema[part].validate(req[part], {
        abortEarly: false, 
        stripUnknown: true, 
      });

      if (error) {
        const message = error.details
          .map((detail) => detail.message)
          .join(", ");
        return next(new ApiError(status.BAD_REQUEST, message));
      }
    }
  }

  next();
};

module.exports = validate;
