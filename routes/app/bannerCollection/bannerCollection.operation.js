const BannerCollection = require("../../../models/bannerCollection")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');
const { lookUpCategory } = require("../../../helpers/category.helper");

const list = async (req, res) => {
    try {
        let query = { isDeleted: { $ne: true } }

        let pageNo = util.defaultPageNo(req.query.pageNo)
        let pageSize = util.defaultPageSize(req.query.pageSize)

        let count = await BannerCollection.find(query).count()
        if (count == 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count)
        }

        let rsp = await BannerCollection
            .aggregate([{
                $match: query
            }, ...lookUpCategory, {
                $sort: {
                    createdAt: -1
                }
            }])
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

        let rsp = await BannerCollection
            .findOne({ _id: util.objectId(id) })
            .populate("category")
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.COLLECTION_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

module.exports = {
    getOne,
    list,
}
