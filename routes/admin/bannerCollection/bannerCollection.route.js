const express = require("express")
const Operation = require("./bannerCollection.operation")
const router = express.Router()
const upload = require("../../../middleware/multerConfig")


router.get("/", Operation.list) 
router.post("/",upload.single('image'), Operation.create) 
router.put("/:id",upload.single('image'), Operation.update)
router.get("/:id", Operation.getOne)
router.delete("/:id", Operation.destory);
module.exports = router