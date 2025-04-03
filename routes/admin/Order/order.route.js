const express = require("express");
const Operation = require("./order.operation");
const router = express.Router();
const upload = require("../../../middleware/multerConfig");

// Routes for order operations
// Get all orders list
router.post("/CancelOrder", Operation.cancelOrder);
router.post("/UpdatePayment", upload.fields([{ name: 'transactionProofImage', maxCount: 3 }]), Operation.updatePayment);
router.post("/UpdateDelivery", upload.fields([{ name: 'deliveryProofImage', maxCount: 3 }]), Operation.updateDelivery);
router.post("/AcceptOrder", Operation.acceptOrder);
router.post("/RemoveClothFromOrder", Operation.removeClothFromOrder);
router.post("/EndOrder", Operation.endOrder);
router.post("/OnCallOrder", Operation.onCallOrder);

// Additional routes
router.post("/", Operation.create);
router.post("/GetOrders", Operation.list);
router.get("/:id", Operation.getOne);

module.exports = router;
