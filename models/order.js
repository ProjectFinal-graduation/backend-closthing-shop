const { pacsdb, mongoose, refTable } = require("./connection");
const baseState = require("../state/base");
const { sizes } = require("../state/size");
const { PaymentStatus, DeliveryStatus, OrderStatus, PaymentMethod  } = require("../state/order");

const OrderSchema = mongoose.Schema(
  {
    id: String,
    fullName: String,
    address: String,
    phone: String,
    note: String,
    cityProvince: refTable("provinces"),
    status: {
      order: {
        type: String,
        validate: {
          validator: function (v) {
            return new RegExp("^(" + baseState.getStateStr(OrderStatus) + ")$").test(v);
          },
          message: "Invalid order status",
        },
        default: OrderStatus.default
      },
      payment: {
        type: String,
        validate: {
          validator: function (v) {
            return new RegExp("^(" + baseState.getStateStr(PaymentStatus) + ")$").test(v);
          },
          message: "Invalid Payment status",
        },
        default: PaymentStatus.default
      },
      delivery: {
        type: String,
        validate: {
          validator: function (v) {
            return new RegExp("^(" + baseState.getStateStr(DeliveryStatus) + ")$").test(v);
          },
          message: "Invalid Delivery status",
        },
        default: DeliveryStatus.default
      },
      paymentMethod : {
        type: String,
        validate: {
          validator: function (v) {
            return new RegExp("^(" + baseState.getStateStr(PaymentMethod) + ")$").test(v);
          },
          message: "Invalid PaymentMethod",
        },
        default: PaymentMethod.default
      },
      deliveryProofImage: [String],
      transactionProofImage: [String],

    },
    cancelNote: String,
    customerNote: String,
    employee: refTable("users"),
    deliveryManPhoneNumber: String,
    totalPrice: Number,
    clothAndQuantities: [{
      quantity: Number,
      cloth: refTable("clothes"),
      sizes: {
        type: String,
        validate: {
          validator: function (v) {
            return new RegExp("^(" + baseState.getStateStr(sizes) + ")$").test(v);
          },
          message: "Invalid sizes",
        },
      },
    }]
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = pacsdb.model("orders", OrderSchema);
