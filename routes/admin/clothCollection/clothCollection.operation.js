const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');
const Cloth = require("../../../models/cloth");


const addClothToCollection = async (req, res) => {
    try {
        const { clothId } = req.body;

        const rsp = await Cloth.updateOne(
            { _id: util.objectId(clothId) },
            {
                $set: {
                    isInCollection: true
                }
            }
        ).catch(err => { throw err; });

        if (rsp.modifiedCount > 0) {
            return util.ReponseSuss(req, res, {}, "Created Successfully")
        }

        return util.ResFail(req, res, ERROR_CODES.CREATE_FAILED);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const list = async (req, res) => {
    try {
        let pageNo = util.defaultPageNo(req.query.pageNo);
        let pageSize = util.defaultPageSize(req.query.pageSize);
        let count = await Cloth.find({ isDeleted: { $ne: true }, isInCollection: true }).count();
        if (count == 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count);
        }
        const cloths = await Cloth.find({ isDeleted: { $ne: true }, isInCollection: true }).catch(err => { throw err; });

        return util.ReponseList(req, res, cloths, pageSize, pageNo, count);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const getOne = async (req, res) => {
    try {
        let id = req.params.id

        let rsp = await Cloth.findOne({ _id: util.objectId(id), isDeleted: { $ne: true },  isInCollection: true })
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.COLLECTION_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}
const destory = async (req, res) => {
    try {
        const { id } = req.params;

        const rsp = await Cloth.updateOne(
            { _id: util.objectId(id) },
            {
                $set: {
                    isInCollection: false
                }
            }
        ).catch(err => { throw err; });

        if (rsp.modifiedCount > 0) {
            return util.ReponseSuss(req, res, {}, "Deleted Successfully")
        }
        
        return util.ResFail(req, res, ERROR_CODES.DELETE_FAILED);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}


module.exports = {
    addClothToCollection,
    destory,
    getOne,
    list,
}
