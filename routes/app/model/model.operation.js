const Models = require("../../../models/model")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');

const list = async (req, res) => {
    try {
        let query = { isDeleted: { $ne: true } }

        let pageNo = util.defaultPageNo(req.query.pageNo)
        let pageSize = util.defaultPageSize(req.query.pageSize)

        let count = await Models.find(query).count()
        if (count == 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count)
        }

        let rsp = await Models
            .find(query)
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
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

        let rsp = await Models.findOne({ _id: util.objectId(id), isDeleted: { $ne: true } })
            .populate("parent")
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.MODEL_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

module.exports = {
    getOne,
    list,
}
