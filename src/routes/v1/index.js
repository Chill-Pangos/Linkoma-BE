const express = require('express');
const docsRoute = require("./docs.route")
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const roleRoute = require("./role.route");
const feedbackRoute = require("./feedback.route");

const router = express.Router();

const defaultRoutes = [
    {
        path: "/docs",
        route: docsRoute,
    },
    {
        path: "/auth",
        route: authRoute,
    },
    {
        path: "/users",
        route: userRoute,
    },
    {
        path: "/roles",
        route: roleRoute,
    },
    {
        path: "/feedbacks",
        route: feedbackRoute,
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

module.exports = router;