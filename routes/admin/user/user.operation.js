const User = require("../../../models/user")
const util = require("../../../exports/util")
const UserServices = require("../../../services/user.services")
const ActiveToken = require("../../../exports/activeToken.exports")
const operationUtils = require('../../../exports/operationUtils')
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');

const login = operationUtils.resultDeal(async (req, res) => {
    const { email, password } = req.body;
    serviceUtils.throwErrorWhenEmpty(email, ERROR_CODES, 'Email is empty');
    serviceUtils.throwErrorWhenEmpty(password, ERROR_CODES, 'Password is empty');

    let query = {
        $or: [{ email: email }, { username: email }],
        password: password,
        // password: util.encode(password),
        isDeleted: { $ne: true }
    }
    let user = await User.findOne(query).lean().exec();

    serviceUtils.throwBadRequestWhenEmpty(user, ERROR_CODES.EMAIL_PASSWORD_404);

    let auth = {
        id: user._id,
        email: user.email,
        username: user.username,
        type: 'token',
        role: user.role
    };
    let tokenMsg = await ActiveToken.buildToken(auth);
    return { token: "Bearer " + tokenMsg.token, user: auth };
});

const getEntityById = async (id) => {
    let rsp = await User.findOne({ _id: id })
        .lean().exec()
        .catch((error) => { throw error });

    return rsp
}

const resetPassword = async (req, res) => {
    try {
        //Should confirm code from telegram id & ...

        return util.ReponseSuss(req, res, {});
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const ping = async (req, res) => {
    try {

        return util.ReponseSuss(req, res, req.user, "Created Successfully");
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const create = async (req, res) => {
    try {
        const { username, email, password, phoneNumber, role, chatId } = req.body;

        const checkEmail = await User.findOne({ email: email, isDeleted: { $ne: true } }).catch(err => { throw err; })
        serviceUtils.throwBadRequestWhenFalse(util.isEmpty(checkEmail), ERROR_CODES.EMAIL_EXIST);

        const rsp = await User({
            username,
            role,
            email,
            phoneNumber,
            chatId,
            password,
            code: await UserServices.getUserCode()
            // password: util.encode(password)
        }).save().catch(error => { throw error; });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.CREATE_FAILED);

        return util.ReponseSuss(req, res, rsp, "Created Successfully");
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const update = async (req, res) => {
    try {
        let id = req.params.id;
        const { username, password, email, phoneNumber, role, chatId } = req.body;

        let data = {
            username,
            role,
            email,
            phoneNumber,
            chatId,
            password
        };

        const rsp = await User.updateOne(
            { _id: util.objectId(id) },
            { $set: data }
        ).catch(err => { throw err; });


        if (rsp.modifiedCount > 0) {
            return util.ReponseSuss(req, res, {}, "Updated Successfully")
        }

        return util.ResFail(req, res, ERROR_CODES.UPDATE_FAILED);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const list = async (req, res) => {
    try {
        let query = { isDeleted: { $ne: true } }

        let pageNo = util.defaultPageNo(req.query.pageNo)
        let pageSize = util.defaultPageSize(req.query.pageSize)

        let count = await User.find(query).count()
        if (count == 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count)
        }

        let rsp = await User
            .find(query, { password: 0 })
            .sort({ createdAt: -1 })
            .catch((error) => {
                throw error
            })

        return util.ReponseList(req, res, rsp, pageSize, pageNo, count)
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const getOne = async (req, res) => {
    try {
        let id = req.params.id

        let rsp = await User.findOne({ _id: util.objectId(id) })
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.USER_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const destory = async (req, res) => {
    try {
        let id = req.params.id

        const rsp = await User.updateOne({ _id: util.objectId(id) }, { $set: { isDeleted: true } })
            .catch(err => {
                throw err;
            });

        if (rsp.modifiedCount > 0) {
            return util.ReponseSuss(req, res, {}, "Deleted Successfully")
        }

        return util.ResFail(req, res, ERROR_CODES.DELETE_FAILED);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

module.exports = {
    login,
    destory,
    getOne,
    list,
    update,
    resetPassword,
    getEntityById,
    create,
    ping
}
