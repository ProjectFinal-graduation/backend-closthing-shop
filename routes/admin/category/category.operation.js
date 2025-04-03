const Category = require("../../../models/category")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');

const create = async (req, res) => {
    try {
        const { name, parent, code } = req.body;

        let data = {
            name: name,
            code: code,
        }

        if (util.notEmpty(parent)) {
            const checkParent = await Category.findOne({ _id: util.objectId(parent) }).catch(err => { throw err; });

            serviceUtils.throwNotFoundWhenEmpty(checkParent, ERROR_CODES.CATEGORY_PARENT_404)

            data.parent = util.objectId(parent);
        }

        const rsp = await Category(data).save().catch(err => { throw err });

        serviceUtils.throwBadRequestWhenEmpty(rsp, ERROR_CODES.CREATE_FAILED)

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const update = async (req, res) => {
    try {
        let id = req.params.id;
        const { name, parent, code } = req.body;
        let data = {
            name: name,
            code: code,
        }

        if (util.notEmpty(parent)) {
            const checkParent = await Category.findOne({ _id: util.objectId(parent) }).catch(err => { throw err; });

            serviceUtils.throwNotFoundWhenEmpty(checkParent, ERROR_CODES.CATEGORY_PARENT_404)

            data.parent = util.objectId(parent);
        }

        const rsp = await Category.updateOne(
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

        let count = await Category.find(query).count()
        if (count == 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count)
        }

        let rsp = await Category
            .find(query)
            .populate("parent")
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

        let rsp = await Category.aggregate([{
            $match: {
                _id: util.objectId(id),
                isDeleted: { $ne: true }
            }
        }, {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parent",
                pipeline: [{
                    $match: {
                        isDeleted: { $ne: true }
                    }
                }],
                as: "child"
            }
        }, {
            $lookup: {
                from: "categories",
                localField: "parent",
                foreignField: "_id",
                pipeline: [{
                    $match: {
                        isDeleted: { $ne: true }
                    }
                }],
                as: "parent",
            }
        }, {
            $addFields: {
                parent: { '$arrayElemAt': ['$parent', 0] }
            }
        },])
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.CATEGORY_404);

        return util.ReponseSuss(req, res, rsp[0]);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const destory = async (req, res) => {
    try {
        let id = req.params.id

        const rsp = await Category.updateOne({ _id: util.objectId(id) }, { $set: { isDeleted: true } })
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
    create,
    destory,
    getOne,
    list,
    update,
}
