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
      url: config.host + "/v1",
    },
  ],
};

module.exports = swaggerDefinition;
