const express = require("express")
const Operation = require("./order.operation")
const router = express.Router()

router.post("/", Operation.create)
module.exports = router