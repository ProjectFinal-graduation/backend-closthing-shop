const express = require("express")
const Operation = require("./clothCollection.operation")
const router = express.Router()

router.get("/", Operation.list) 
router.post("/", Operation.addClothToCollection) 
router.get("/:id", Operation.getOne)
router.delete("/:id", Operation.destory)

module.exports = router