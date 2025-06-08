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
    HOST: Joi.string().required().description("Server host"),
    DB_CA: Joi.string()
      .description("MySQL CA certificate path, if using SSL"),
    DB_HOST: Joi.string()
      .default("localhost")
      .description("MySQL database host, default is localhost"),
    DB_PORT: Joi.number()
      .default(3306)
      .description("MySQL database port, default is 3306"),
    DATABASE: Joi.string().required().description("MySQL database name"),
    USER: Joi.string().required().description("MySQL database user"),
    PASSWORD: Joi.string().required().description("MySQL database password"),
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
  host: envVars.HOST,
  mysql: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    ca: envVars.DB_CA,
    database: envVars.DATABASE,
    username: envVars.USER,
    password: envVars.PASSWORD,
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
