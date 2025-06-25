const express = require('express');
const docsRoute = require("./docs.route")
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const roleRoute = require("./role.route");
const feedbackRoute = require("./feedback.route");
const announcementRoute = require("./announcement.route");
const apartmentRoute = require("./apartment.route");
const apartmentTypeRoute = require("./apartmentType.route");
const serviceTypeRoute = require("./serviceType.route");
const serviceRegistrationRoute = require("./serviceRegistration.route");
const invoiceRoute = require("./invoice.route");
const invoiceDetailRoute = require("./invoiceDetail.route");
const adminRoute = require("./admin.route");

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
    },
    {
        path: "/announcements",
        route: announcementRoute,
    },
    {
        path: "/apartments",
        route: apartmentRoute,
    },
    {
        path: "/apartment-types",
        route: apartmentTypeRoute,
    },
    {
        path: "/service-types",
        route: serviceTypeRoute,
    },
    {
        path: "/service-registrations",
        route: serviceRegistrationRoute,
    },
    {
        path: "/invoices",
        route: invoiceRoute,
    },
    {
        path: "/invoice-details",
        route: invoiceDetailRoute,
    },
    {
        path: "/admin",
        route: adminRoute,
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

module.exports = router;