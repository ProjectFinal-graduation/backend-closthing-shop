const express = require("express")
const Operation = require("./category.operation")
const router = express.Router()

router.get("/", Operation.list) 
router.post("/", Operation.create) 
router.put("/:id", Operation.update)
router.get("/:id", Operation.getOne)
router.delete("/:id", Operation.destory)

module.exports = router