const { version } = require("../../package.json");

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
      url: "http://localhost:3000/v1",
    },
  ],
};

module.exports = swaggerDefinition;
