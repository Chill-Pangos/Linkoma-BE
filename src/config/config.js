const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../.env") });

const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    HOST: Joi.string().required(),
    USERNAME: Joi.string().required(),
    PASSWORD: Joi.string().required(),
    DATABASE: Joi.string().required(),
  })
  .unknown();

const { error, value: envVars } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

  if(error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mysql: {
      host: envVars.HOST,
      user: envVars.USER,
      password: envVars.PASSWORD,
      database: envVars.DATABASE,
    },
}
