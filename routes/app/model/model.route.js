const express = require("express")
const Operation = require("./model.operation")
const router = express.Router()

router.get("/", Operation.list) 
router.get("/:id", Operation.getOne)

module.exports = router