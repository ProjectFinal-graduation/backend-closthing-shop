const express = require("express")
const Operation = require("./cloth.operation")
const router = express.Router()

router.get("/", Operation.getAvailableClothes) 
router.get("/newArrival", Operation.newArrival);
router.post("/getCart", Operation.getCartItems)
router.post("/getClothesByCategory", Operation.getClothesByCategory)
router.get("/collection", Operation.getCollection);
router.post("/recent", Operation.getRecent);
router.get("/:id", Operation.getOne)

module.exports = router