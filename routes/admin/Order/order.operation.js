const Order = require("../../../models/order");
const Cloth = require("../../../models/cloth");
const literal = require("../../../exports/literal");
const util = require("../../../exports/util");
const serviceUtils = require("../../../exports/serviceUtils");
const ERROR_CODES = require("../../../errorcodes/index.code");
const errorUtils = require("../../../exports/errorUtils");
const telegramBot = require("../../../services/telegramBot.services");
const { getOrderCode } = require("../../../services/user.services");
const {
  uploadImages,
  deleteImage,
} = require("../../../services/uploadImage.services");

const create = async (req, res) => {
  try {
    const {
      ClothSizeQuantities,
      fullName,
      address,
      phone,
      note,
      cityProvince,
    } = req.body;

    console.log("ClothSizeQuantities", ClothSizeQuantities);
    if (!ClothSizeQuantities) {
      return util.ResFail(req, res, ERROR_CODES.ORDER_CREATE_FAILED);
    }

    const status = {
      deliveryProofImage: [],
      transactionProofImage: [],
    };

    // Handle deliveryProofImage
    //   if(req.files){

    //   if (req.files['deliveryProofImage']) {
    //     console.log("deliveryProofImage", req.files['deliveryProofImage']);
    //     const deliveryProofImages = await uploadImages(req.files['deliveryProofImage'].map((file) => ({
    //         fileName: file.originalname,
    //         contentType: file.mimetype,
    //         data: file.buffer,
    //       })), "deliveryProofImage", );
    //     status.deliveryProofImage = deliveryProofImages;
    //   }

    //   // Handle transactionProofImage
    //   if (req.files['transactionProofImage']) {
    //     console.log("transactionProofImage", req.files['transactionProofImage']);
    //     const transactionProofImages = await uploadImages(req.files['transactionProofImage'].map((file) => ({
    //         fileName: file.originalname,
    //         contentType: file.mimetype,
    //         data: file.buffer,
    //       })), "transactionProofImage", );
    //     status.transactionProofImage = transactionProofImages;
    //   }
    // }
    let totalPrice = 0;

    // Calculate total price

    console.log("ClothSizeQuantities", ClothSizeQuantities);
    // ClothSizeQuantitiesJSON = JSON.parse(ClothSizeQuantities);
    for (const cloth of ClothSizeQuantities) {
      cloth.quantity = parseInt(cloth.quantity);
      const clothId = cloth.cloth;

      const clothData = await Cloth.findById(clothId);
      if (!clothData) {
        return util.ResFail(
          req,
          res,
          ERROR_CODES.CLOTH_NOT_FOUND,
          `Cloth not found with id: ${clothId}`
        );
      }
      const price = clothData.price;
      totalPrice += price * cloth.quantity;
    }
    totalPrice = Math.round(totalPrice * 100) / 100;
    const data = {
      fullName,
      address,
      id: await getOrderCode(),
      phone,
      note,
      cityProvince,
      status,
      totalPrice,
      clothAndQuantities: ClothSizeQuantities,
      createdBy: req.user,
    };

    const newOrder = new Order(data);
    await newOrder.save();
    telegramBot.sendNewOrderNotification(newOrder._id);

    return util.ResSuss(req, res, newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};
const list = async (req, res) => {
  try {
    let pageNo = parseInt(req.body.PageIndex) || 1;
    let pageSize = parseInt(req.body.Limit) || 10;
    const search = req.body.Search || "";
    const deliveryStatus = req.body.DeliveryStatus;
    const startDate = req.body.StartDate ? new Date(req.body.StartDate) : null;
    const endDate = req.body.EndDate ? new Date(req.body.EndDate) : null;
    const orderStatus = req.body.OrderStatus;
    const paymentStatus = req.body.PaymentStatus;

    const query = {};

    if (search) {
      query.fullName = { $regex: search, $options: "i" };
    }
    if (deliveryStatus) {
      query["status.delivery"] = deliveryStatus;
    }

    util.getQueryBetweenDate(query, startDate, endDate, "createdAt");

    if (orderStatus) {
      query["status.order"] = orderStatus;
    }
    if (paymentStatus) {
      query["status.payment"] = paymentStatus;
    }

    const orders = await Order.find(query)
      .populate("cityProvince")
      .populate("employee")
      .populate("clothAndQuantities.cloth")
      .populate("clothAndQuantities.cloth.category")
      .skip(pageSize * (pageNo - 1))
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    if (orders.length === 0) {
      return util.ReponseList(req, res, [], pageNo, pageSize, 0);
    }
    return util.ReponseList(req, res, orders, pageNo, pageSize, total);
  } catch (error) {
    console.error("Error getting orders:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const getOne = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log("orderId", orderId);
    const order = await Order.findById(orderId)
      .populate("cityProvince")
      .populate("employee")
      .populate("clothAndQuantities.cloth")
      .populate("clothAndQuantities.cloth.category")
    if (!order) {
      return util.ResFail(
        req,
        res,
        ERROR_CODES.ORDER_NOT_FOUND,
        `Order not found with id: ${orderId}`
      );
    }
    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error getting order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const onCallOrder = async (req, res) => {
  try {
    const { orderId, totalProducts } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return util.ResFail(
        req,
        res,
        ERROR_CODES.ORDER_NOT_FOUND,
        `Order not found with id: ${orderId}`
      );
    }
    const clothAndQuantities = [];
    for (const cloth of totalProducts) {
      const clothData = await Cloth.findById(cloth.cloth);
      if (!clothData) {
        return util.ResFail(
          req,
          res,
          ERROR_CODES.CLOTH_NOT_FOUND,
          `Cloth not found with id: ${cloth.cloth}`
        );
      }
      clothAndQuantities.push({
        cloth: cloth.cloth,
        sizes: cloth.sizes,
        quantity: cloth.quantity,
      });
    }
    order.clothAndQuantities = clothAndQuantities;
    await order.save();
    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error getting order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return util.ResFail(
        req,
        res,
        ERROR_CODES.ORDER_NOT_FOUND,
        `Order not found with id: ${orderId}`
      );
    }
    order.status.order = literal.ORDER_STATUS.PROCESSING;
    order.employee = req.user;
    await order.save();
    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error getting order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { cancelNote, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return util.ResFail(
        req,
        res,
        ERROR_CODES.ORDER_NOT_FOUND,
        `Order not found with id: ${orderId}`
      );
    }
    order.status.order = literal.ORDER_STATUS.CANCELLED;
    order.cancelNote = cancelNote;
    order.employee = req.user;
    await order.save();
    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error getting order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const updatePayment = async (req, res) => {
  try {
    let  { paymentStatus, orderId, oldTransactionProofImage, paymentMethod } = req.body;
    const order = await Order.findById(orderId);

    order.status.payment = paymentStatus;
    
    if (util.isEmpty(oldTransactionProofImage)) {
      oldTransactionProofImage = [];
    }

      const imagesToRemoved = [];
      for (const image of order.status.transactionProofImage) {
        if (!oldTransactionProofImage.includes(image)) {
          console.log("Image to be removed", image);
          imagesToRemoved.push(image);
        }
        console.log("oldTransactionProofImage", oldTransactionProofImage);
      }
      console.log("imagesToRemoved", imagesToRemoved);
      if (imagesToRemoved.length > 0) {
        for (const image of imagesToRemoved) {
          await deleteImage(image);
        }
        order.status.transactionProofImage = order.status.transactionProofImage.filter(
          (image) => !imagesToRemoved.includes(image)
        );
      }

    if (req.files) {
      if (req.files["transactionProofImage"]) {
        const transactionProofImages = await uploadImages(
          req.files["transactionProofImage"].map((file) => ({
            fileName: file.originalname,
            contentType: file.mimetype,
            data: file.buffer,
          })),
          "transactionProofImage"
        );
        order.status.transactionProofImage = order.status.transactionProofImage.concat(
          transactionProofImages
        );
      }

    }
    order.status.paymentMethod = paymentMethod;
    await order.save();
    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error getting order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const updateDelivery = async (req, res) => {
  try {
    const { deliveryStatus, orderId, deliveryManPhoneNumber, oldDeliveryProofImage } = req.body; 
    const order = await Order.findById(orderId);
    
    if (!order) {
      return util.ResFail(req, res, ERROR_CODES.ORDER_NOT_FOUND, `Order not found with id: ${orderId}`);
    }

    const imagesToRemoved = [];

    order.status.delivery = deliveryStatus;
    if (deliveryStatus === literal.DELIVERY_STATUS.DELIVERING) {
      order.status.order = literal.ORDER_STATUS.PROCESSING;
    }

    if (oldDeliveryProofImage) {
      for (const image of order.status.deliveryProofImage) {
        if (!oldDeliveryProofImage.includes(image)) {
          console.log("Image to be removed", image);
          imagesToRemoved.push(image);
        }
        console.log("oldDeliveryProofImage", oldDeliveryProofImage);
      }
    }
    console.log("imagesToRemoved", imagesToRemoved);
    if (imagesToRemoved.length > 0) {
      for (const image of imagesToRemoved) {
        await deleteImage(image);
      }
      order.status.deliveryProofImage = order.status.deliveryProofImage.filter(
        (image) => !imagesToRemoved.includes(image)
      );
    }

    if (req.files && req.files["deliveryProofImage"]) {
      const deliveryProofImages = await uploadImages(
        req.files["deliveryProofImage"].map((file) => ({
          fileName: file.originalname,
          contentType: file.mimetype,
          data: file.buffer,
        })),
        "deliveryProofImage",order._id
      );

      order.status.deliveryProofImage = order.status.deliveryProofImage.concat(deliveryProofImages);
    }

    order.deliveryManPhoneNumber = deliveryManPhoneNumber;

    await order.save();

    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error updating delivery:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};


const removeClothFromOrder = async (req, res) => {
  try {
    const { orderId, clothId, size } = req.body;
    
    const order = await Order.findById(orderId).populate("clothAndQuantities.cloth");
    
    if (!order) {
      return util.ResFail(req, res, ERROR_CODES.ORDER_NOT_FOUND, `Order not found with id: ${orderId}`);
    }
    console.log("order", order);
    let clothToRemove = null;
    let deductPrice = 0;

    for (const cloth of order.clothAndQuantities) {
      console.log("cloth", cloth._id);
      if (cloth.cloth._id == clothId && cloth.sizes === size) {
        clothToRemove = cloth;
        deductPrice = cloth.cloth.price * cloth.quantity;
        break;
      }
    }

    if (!clothToRemove) {
      return util.ResFail(req, res, ERROR_CODES.CLOTH_404, `Cloth not found with id: ${clothId} and size: ${size}`);
    }

    order.totalPrice -= deductPrice;

    order.clothAndQuantities = order.clothAndQuantities.filter(
      (cloth) => cloth.cloth._id != clothId || cloth.sizes !== size
    );

    await order.save();

    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error removing cloth from order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const addClothToOrder = async (req, res) => {
  try {
    const { orderId, clothId, size, quantity } = req.body;
    const order = await
      Order.findById(orderId);
    if (!order) {
      return util.ResFail(
        req,
        res,
        ERROR_CODES.ORDER_NOT_FOUND,
        `Order not found with id: ${orderId}`
      );
    }
    const clothAndQuantities = order.clothAndQuantities;
    var addPrice = 0;
    for (const cloth of clothAndQuantities) {
      if (cloth.cloth == clothId && cloth.sizes == size) {
        cloth.quantity += quantity;
        addPrice += cloth.cloth.price * quantity;
        break;
      } else {
        clothAndQuantities.push({
          cloth: clothId,
          sizes: size,
          quantity: quantity,
        });
        addPrice += cloth.cloth.price * quantity;
      }
    }
    order.totalPrice += addPrice;
    await order.save();
    return util.ResSuss(req, res, order);
  }
  catch (error) {
    console.error("Error getting order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
}

const endOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    serviceUtils.throwNotFoundWhenEmpty(order, ERROR_CODES.ORDER_NOT_FOUND);

    serviceUtils.throwBadRequestWhenFalse(order.status.payment === literal.PAYMENT_STATUS.PAID, ERROR_CODES.ORDER_NOT_PAID);
      
    serviceUtils.throwBadRequestWhenFalse(order.status.delivery === literal.DELIVERY_STATUS.DELIVERED, ERROR_CODES.ORDER_NOT_DELIVERY);
    
    order.status.order = literal.ORDER_STATUS.COMPLETED;
    await order.save();
    return util.ResSuss(req, res, order);
  } catch (error) {
    console.error("Error getting order:", error);
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};


module.exports = {
  create,
  list,
  getOne,
  onCallOrder,
  acceptOrder,
  cancelOrder,
  updatePayment,
  updateDelivery,
  removeClothFromOrder,
  addClothToOrder,
  endOrder,
};
