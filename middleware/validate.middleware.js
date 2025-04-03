const ErrorCode = require("../errorcodes/index.code")
const util = require("../exports/util")
const ActiveToken = require("../exports/activeToken.exports")
const User = require("../routes/admin/user/user.operation")
const operationUtils = require('../exports/operationUtils')
const serviceUtils = require('../exports/serviceUtils')

const power = () => {
    return operationUtils.resultDeal(async (req, res, next) => {

        if (!req.headers.authorization) {
            throw new operationUtils.CommonError(ErrorCode.NO_TOKEN);
        }
        let tokenMsg = null;
        try {
            tokenMsg = await ActiveToken.verifyToken(req.headers.authorization)
        } catch (err) {
            throw new operationUtils.CommonError(ErrorCode.TOKEN_ERROR);
        }

        let user = await User.getEntityById(tokenMsg.id);
        if (serviceUtils.isNull(user)) { throw new operationUtils.CommonError(ErrorCode.TOKEN_ERROR); }

        req.user = user;

        if (parseInt(process.env.IsCheckAuth) == 1) {
            return util.ReponseFail(req, res, 403, "No Auth")
        }

        req.getAuth = () => { return { tokenMsg, user }; } // TODO: TO Remove after refactor 
        next();
        return new operationUtils.RespResult({ _fw_not_response: true });
    });
}

/**
 * 
 * @param {*} req 
 * @returns {{tokenMsg:{id, siteId, email, roleCodes}}}
 */
// TODO: TO Remove after refactor 
const getAuth = (req) => {
    if (req.getAuth) {
        return req.getAuth();
    } else {
        return null;
    }
}

const adminLogin = async function (req, res, next) {
    if (util.isEmpty(req.headers.authorization)) {
        return util.ReponseFail(req, res, 400, "No Token")
    }

    let admin = await ActiveToken.verifyToken(req.headers.authorization)
    if (typeof admin == "string") {
        return util.ReponseFail(req, res, 401, admin)
    }

    if (JSON.stringify(admin) == "{}" || admin.id == "") {
        return util.ReponseFail(req, res, 400, "No login")
    }

    newToken = await ActiveToken.delayToken(admin)
    req.body.newJwtToken = newToken != "" ? newToken : ""

    next()
}

const validate = (schema, auth) => async (req, res, next) => {
    return next() //暂时取消验证,功能测试好了再开发
}

module.exports = { validate, adminLogin, power, getAuth }
