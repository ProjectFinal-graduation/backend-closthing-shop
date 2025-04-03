const express = require("express")
const Operation = require("./report.operation")
const router = express.Router()

router.get("/", Operation.getReport) 

module.exports = router