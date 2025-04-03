const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")
const dayjs = require("dayjs")
const APP_NAME = "pacs-controller-services"
let uptime = null
const contextUtils = require('./exports/contextUtils')

//* configure dotenv
dotenv.config()

contextUtils.run(async () => {
    app.use(cors())
    app.options("*", cors())
    app.use(bodyParser.json({ limit: process.env.LimitbodyParser }))
    app.use(bodyParser.urlencoded({ limit: process.env.LimitbodyParser, extended: true }))

    //* Connect to MONGODB Database -> listen on PORT
    mongoose
        .connect(process.env.DATABASE_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((__, err) => {
            if (!err) {
                console.log("Connected to PACS Mongo Database")
            } else {
                console.log(err)
            }
        })
        

    let PORT = process.env.PORT || 8080
    app.listen(PORT, () => {
        console.log("App Started");
        console.log("Listen to port " + PORT);
    })


    //* HEALTH CHECKER
    app.get("/", (_, res) => {
        res.send({
            active: true,
            message: `${APP_NAME} V${VERSION_NUMBER} is up and running from ${uptime.format("LLL")}`,
            initiationTS: uptime,
            activeSince: `${moment.utc().diff(uptime, "seconds")} Seconds`,
        })
    })

    // RoutingList of group
    const AppRouter = require("./routes/app")
    AppRouter.RoutingList(app)

    const AdminRouter = require("./routes/admin")
    AdminRouter.RoutingList(app)
});
