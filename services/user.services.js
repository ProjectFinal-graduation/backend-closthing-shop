const Cloth = require("../models/cloth");
const Order = require("../models/order");
const {
    USER_CODE,
    CLOTH_CODE,
    ORDER_CODE
} = require("../exports/literal");
const User = require("../models/user");
const Util = require("../exports/util");


const getUserCode = async () => {
    const lastExc = await User.findOne({}).sort({ _id: -1 })
        .catch((err) => { throw err });

    let inc = 1;
    if (Util.notEmpty(lastExc) && Util.notEmpty(lastExc.code)
        && String(lastExc.code).includes(USER_CODE.PRE_FIX)
    ) {
        let codeNum = String(lastExc.code).replace(USER_CODE.PRE_FIX, '');
        inc = parseInt(codeNum) + 1;
    }

    return USER_CODE.PRE_FIX + "" + String(inc).padStart(6, 0);
}

const getClothCode = async () => {
    try {
        const lastExc = await Cloth.findOne({}).sort({ _id: -1 });

        let inc = 1;
        if (Util.notEmpty(lastExc) && Util.notEmpty(lastExc.id) &&
            String(lastExc.id).startsWith(CLOTH_CODE.PRE_FIX)) {

            let codeNum = String(lastExc.id).replace(CLOTH_CODE.PRE_FIX, '');

            if (!isNaN(codeNum)) {
                inc = parseInt(codeNum) + 1;
            }
        }

        return CLOTH_CODE.PRE_FIX + String(inc).padStart(6, '0');
    } catch (error) {
        console.error("Error fetching last cloth code:", error);
        throw error;
    }
}

const getOrderCode = async () => {
    try {
        const lastExc = await Order.findOne({}).sort({ _id: -1 });

        let inc = 1;
        if (Util.notEmpty(lastExc) && Util.notEmpty(lastExc.id) &&
            String(lastExc.id).startsWith(ORDER_CODE.PRE_FIX)) {

            let codeNum = String(lastExc.id).replace(ORDER_CODE.PRE_FIX, '');

            if (!isNaN(codeNum)) {
                inc = parseInt(codeNum) + 1;
            }
        }

        return ORDER_CODE.PRE_FIX + String(inc).padStart(6, '0');
    } catch (error) {
        console.error("Error fetching last cloth code:", error);
        throw error;
    }
}


module.exports = {
    getUserCode,
    getClothCode,
    getOrderCode
}