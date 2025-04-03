const Province = require("../../../models/province")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');

const update = async (req, res) => {
    try {
        let id = req.params.id;
        const { deliveryFee } = req.body;

        const rsp = await Province.updateOne(
            { _id: util.objectId(id) },
            {
                $set: {
                    deliveryFee: deliveryFee,
                }
            }
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
        let query = { }

        let pageNo = util.defaultPageNo(req.query.pageNo)
        let pageSize = util.defaultPageSize(req.query.pageSize)

        let count = await Province.find(query).count()
        if (count == 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count)
        }

        let rsp = await Province
            .find(query)
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

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.PROVINCE_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

module.exports = {
    getOne,
    list,
    update,
}
