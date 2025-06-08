const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

require("dotenv").config();

const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000).description("Server port"),
    HOST: Joi.string().required().description("MySQL host"),
    DB_URL: Joi.string().uri().description("MySQL database URL"),
    DATABASE: Joi.string().required().description("MySQL database name"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access token expires"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh token expires"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    EMAIL_USER: Joi.string()
      .required()
      .description("Email user for sending emails"),
    EMAIL_PASSWORD: Joi.string()
      .required()
      .description("Email password for sending emails"),
    FRONTEND_URL: Joi.string().uri().required().description("Frontend URL"),
  })
  .unknown();

const { error, value: envVars } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mysql: {
    host: envVars.HOST,
    url: envVars.DB_URL,
    database: envVars.DATABASE,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  },
  email: {
    user: envVars.EMAIL_USER,
    password: envVars.EMAIL_PASSWORD,
  },
  frontendUrl: envVars.FRONTEND_URL,
};
