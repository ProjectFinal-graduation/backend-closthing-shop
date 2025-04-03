const express = require("express")
const bannerCollectionRoute = require("./app/bannerCollection/bannerCollection.route")
const CategoryRoute = require("./app/category/category.route")
const ProvinceRoute = require("./app/province/province.route")
const OrderRoute = require("./app/order/order.route")
const ClothRoute = require("./app/cloth/cloth.route")

const routerApp = express.Router()

const RoutingList = (app) => {
    const routes = [
        {
            path: "/bannerCollections",
            route: bannerCollectionRoute,
        },
        {
            path: "/categories",
            route: CategoryRoute,
        },
        {
            path: "/provinces",
            route: ProvinceRoute,
        },
        {
            path: "/orders",
            route: OrderRoute,
        },
        {
            path: "/clothes",
            route: ClothRoute
        }

    ]

    routes.forEach((route) => {
        routerApp.use(route.path, route.route)
    })

    app.use("/app", routerApp)
}

module.exports = { RoutingList }
