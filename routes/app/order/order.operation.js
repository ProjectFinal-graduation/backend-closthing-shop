const util = require("../../../exports/util");
const Cloth = require("../../../models/cloth");
const Order = require("../../../models/order");
const Province = require("../../../models/province");
const serviceUtils = require('../../../exports/serviceUtils');
const ERROR_CODES = require('../../../errorcodes/index.code');
const errorUtils = require('../../../exports/errorUtils');
const telegramBot = require("../../../services/telegramBot.services");
const literal = require('../../../exports/literal');
const {getOrderCode} = require("../../../services/user.services");


const create = async (req, res) => {
    try {
        const { name, address, provinceId, phone, note, ClothSizeQuantities } = req.body;

        if (!phone || !ClothSizeQuantities || ClothSizeQuantities.length === 0) {
            return util.ResFail(req, res, ERROR_CODES.MISSING_REQUIRED_FIELDS, 'Phone number and Cloth Size Quantities are required.');
        }

        const status = {
            deliveryProofImage: [],
            transactionProofImage: []
        };

        const province = await Province.findById(provinceId);
        if (!province) {
            return util.ResFail(req, res, ERROR_CODES.BAD_REQUEST, `Province not found with id: ${provinceId}`);
        }

        let totalPrice = 0;
        for (const cloth of ClothSizeQuantities) {
            cloth.quantity = parseInt(cloth.quantity, 10);
            if (isNaN(cloth.quantity) || cloth.quantity <= 0) {
                return util.ResFail(req, res, ERROR_CODES.BAD_REQUEST, `Invalid quantity for cloth: ${cloth.cloth}`);
            }

            const clothData = await Cloth.findById(cloth.cloth);
            if (!clothData) {
                return util.ResFail(req, res, ERROR_CODES.BAD_REQUEST, `Cloth not found with id: ${cloth.cloth}`);
            }

            totalPrice += clothData.price * cloth.quantity;
        }

        totalPrice = Math.round(totalPrice * 100) / 100;

        const order = new Order({
            fullName: name,
            address,
            phone,
            id: await getOrderCode(),
            note,
            cityProvince: province,
            status,
            totalPrice,
            clothAndQuantities: ClothSizeQuantities
        });

        await order.save();

        telegramBot.sendNewOrderNotification(order._id);

        return util.ResSuss(req, res, order);
    } catch (error) {
        console.error('Error creating order:', error);

        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};

module.exports = {
    create
};