const express = require("express");
// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");
// const swaggerDefinition = require("../../docs/swagger");

const router = express.Router();

// Temporarily disable swagger to debug path-to-regexp error
// const specs = swaggerJsdoc({
//     swaggerDefinition,
//     apis: ["src/docs/*.yml", "src/routes/v1/*.js"],
// })

// router.use("/", swaggerUi.serve);
// router.get("/", swaggerUi.setup(specs, {
//     explorer: true,
// }))

// Simple fallback route
router.get("/", (req, res) => {
    res.json({ message: "API Documentation temporarily disabled" });
});

module.exports = router;