const Category = require("../../../models/category")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');
const { lookUpParent, lookUpChild } = require("../../../helpers/category.helper");

const list = async (req, res) => {
    try {

        let rsp = await Category.aggregate([
            {
                $match: {
                    isDeleted: { $ne: true }
                }
            },
            lookUpParent,
            {
                $match: {
                    parent: [],
                }
            },
            lookUpChild
        ]).catch((error) => { throw error })

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const getOne = async (req, res) => {
    try {
        let id = req.params.id

        let rsp = await Category.aggregate([
            {
                $match: {
                    _id: util.objectId(id),
                    isDeleted: { $ne: true }
                }
            }, lookUpChild
        ])

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.CATEGORY_404);

        return util.ReponseSuss(req, res, rsp[0]);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

module.exports = {
    getOne,
    list,
}
