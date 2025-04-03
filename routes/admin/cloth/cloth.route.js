const express = require("express")
const Operation = require("./cloth.operator")
const router = express.Router()
const upload = require("../../../middleware/multerConfig")

router.post("/",upload.array('images'), Operation.create)
router.get("/", Operation.list)
router.get("/:id", Operation.getOne)
router.put("/:id",upload.array('images'), Operation.update)
router.delete("/:id", Operation.destory)


module.exports = router