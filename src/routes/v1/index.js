const express = require('express');
const docsRoute = require("./docs.route")
const authRoute = require("./auth.route");

const router = express.Router();

const defaultRoutes = [
    {
        path: "/docs",
        route: docsRoute,
    },
    {
        path: "/auth",
        route: authRoute,
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

module.exports = router;