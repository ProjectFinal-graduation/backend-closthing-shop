const Province = require("../../../models/province")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');

const list = async (req, res) => {
    try {
        let query = { }

        let pageNo = util.defaultPageNo(req.query.pageNo)
        let pageSize = util.defaultPageSize(req.query.pageSize)

        let count = await Province.find(query).count()
        if (count == 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count)
        }

        let rsp = await Province
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

        let rsp = await Province.findOne({ _id: util.objectId(id) })
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.CATEGORY_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

module.exports = {
    getOne,
    list,
}
