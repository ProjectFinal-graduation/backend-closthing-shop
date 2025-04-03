const express = require("express")
const Operation = require("./province.operation")
const router = express.Router()

router.get("/", Operation.list) 
router.put("/:id", Operation.update)
router.get("/:id", Operation.getOne)

module.exports = router