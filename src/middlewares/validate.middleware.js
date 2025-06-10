const Joi = require("joi");
const apiError = require("../utils/apiError");
const httpStatus = require("http-status");

/**
 * @description Middleware to validate request data against a Joi schema.
 * @param {Object} schema - The Joi schema to validate against.
 * @returns {Function} - Express middleware function.
 * @throws {apiError} - Throws an error if validation fails.
 */

const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (!req) {
        return next(new apiError(500, 'Request object is undefined'));
      }

      if (!schema) {
        return next(new apiError(500, 'Validation schema is undefined'));
      }

      const validParts = ["body", "query", "params", "cookies"];

      for (const part of validParts) {
        if (schema[part]) {
          // Ensure req[part] exists, provide empty object as default
          const dataToValidate = req[part] || {};
          
          const { error } = schema[part].validate(dataToValidate, {
            abortEarly: false, 
            stripUnknown: true, 
          });

          if (error) {
            const message = error.details
              .map((detail) => detail.message)
              .join(", ");
            return next(new apiError(400, message));
          }
        }
      }

      next();
    } catch (err) {
      return next(new apiError(500, 'Validation middleware error: ' + err.message));
    }
  };
};

module.exports = validate;
