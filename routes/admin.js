const express = require("express")
const userRoute = require("./admin/user/user.route")
const bannerCollectionRoute = require("./admin/bannerCollection/bannerCollection.route")
const CategoryRoute = require("./admin/category/category.route")
const ClothRoute = require("./admin/cloth/cloth.route")
const modelRoute = require("./admin/model/model.route")
const ProvinceRoute = require("./admin/province/province.route")
const  testBody = require("./admin/clothCollection/clothCollection.route")
const OrderRoute = require("./admin/Order/order.route")
const validateMiddleware = require("../middleware/validate.middleware")
const reportRoute = require("./admin/report/report.route")


const routerApp = express.Router()

const RoutingList = (app) => {
    const routes = [
        {
            path: "/users",
            route: userRoute.router,
        },
        {
            path: "/bannerCollections",
            route: bannerCollectionRoute,
        },
        {
            path: "/categories",
            route: CategoryRoute,
        },
        {
            path: "/clothes",
            route: ClothRoute,
        },
        {
            path: "/models",
            route: modelRoute,
        },
        {
            path: "/provinces",
            route: ProvinceRoute,
        },
        {
            path: "/clothCollections",
            route: testBody,
        },
        {
            path: "/orders",
            route: OrderRoute,
        },
        {
            path: "/reports",
            route: reportRoute,
        },
    ]

    routerApp.post("/login", userRoute.Operation.login)

    routerApp.use(validateMiddleware.power())

    routerApp.post("/ping", userRoute.Operation.ping)

    routes.forEach((route) => {
        routerApp.use(route.path, route.route)
    })

    app.use("/admin", routerApp)
}

module.exports = { RoutingList }
