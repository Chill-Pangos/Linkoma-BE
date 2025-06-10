const { version } = require("../../package.json");
const config = require("../config/config");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Linkoma API",
    version,
    license: {
      name: "MIT",
      url: "https://github.com/Chill-Pangos/Linkoma-BE/blob/main/LICENSE",
    },
    description: "Linkoma API documentation",
  },
  servers: [
    {
      url: `http://${config.host}:${config.port}/v1`,
      description: 'Development server'
    },
  ],
};

module.exports = swaggerDefinition;
