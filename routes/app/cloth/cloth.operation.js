const Cloth = require("../../../models/cloth");
const Category = require("../../../models/category");
const util = require("../../../exports/util");
const serviceUtils = require("../../../exports/serviceUtils");
const ERROR_CODES = require("../../../errorcodes/index.code");
const errorUtils = require("../../../exports/errorUtils");
const { sizes } = require("../../../state/size");
const categoryHelpers = require("../../../helpers/category.helper");
const clothHelpers = require("../../../helpers/cloth.helper");

const getOne = async (req, res) => {
    try {
        let id = req.params.id;

        let rsp = await Cloth
            .findOne({ _id: util.objectId(id), isDeleted: { $ne: true } })
            .populate("category", "_id name")
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.CLOTH_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const newArrival = async (req, res) => {
    try {
        let rsp = await Cloth.find({ isDeleted: { $ne: true } })
            .limit(20)
            .sort({ createdAt: -1 })
            .catch((error) => {
                throw error;
            });
        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};
const getAvailableClothes = async (req, res) => {
    try {
        const { search } = req.query;

        let pageNo = util.defaultPageNo(req.query.pageNo);
        let pageSize = util.defaultPageSize(req.query.pageSize);
        let searchQuery = search || "";

        let query = { isDeleted: { $ne: true }, isAvailable: true };
        if (searchQuery) {
            query.$or = [
                { id: { $regex: searchQuery, $options: 'i' } },
                { name: { $regex: searchQuery, $options: 'i' } },
                { code: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        let count = await Cloth.countDocuments(query).catch(error => { throw error; });

        if (count === 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count);
        }

        const cloths = await Cloth.find(query)
            .populate({
                path: "category",
                select: "name code _id",
            })
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .exec()
            .catch(error => { throw error; });

        return util.ReponseList(req, res, cloths, pageSize, pageNo, count);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};

const getCartItems = async (req, res) => {
    try {
        const { clothes } = req.body;

        const query = {
            $or: clothes.map(cloth => ({
                _id: util.objectId(cloth.clothId),
                sizes: cloth.size
            })),
            isDeleted: { $ne: true },
            isAvailable: true
        }

        const rsp = await Cloth.aggregate([{
            $match: query
        }, {
            $addFields: {
                Detail: {
                    $filter: {
                        input: clothes.map(item => ({
                            clothId: util.objectId(item.clothId),
                            Size: item.size,
                            Quantity: item.quantity
                        })),
                        as: "item",
                        cond: {
                            $eq: ["$$item.clothId", "$_id"]
                        }
                    }
                }
            }
        },
        {
            $match: {
                Detail: { $ne: [] }
            }
        },
        {
            $unwind: {
                path: "$Detail",
                preserveNullAndEmptyArrays: true
            }
        }]).catch(error => {
            throw error;
        })

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};

const getClothesByCategory = async (req, res) => {
    try {
        const { categoryId, Sort } = req.body;
        let pageNo = util.defaultPageNo(req.body.pageNo);
        let pageSize = util.defaultPageSize(req.body.pageSize);

        const category = await Category.aggregate([{
            $match: {
                _id: util.objectId(categoryId),
                isDeleted: { $ne: true }
            }
        }, categoryHelpers.lookUpChild]).catch(err => { throw err; });

        serviceUtils.throwBadRequestWhenEmpty(category, ERROR_CODES.CATEGORY_404);

        let query = {
            category: { $in: [util.objectId(categoryId)].concat(category[0].childs.map(i => i._id)) },
            isDeleted: { $ne: true },
        };

        let count = await Cloth.countDocuments(query).catch(error => { throw error; })

        if (count === 0) {
            return util.ReponseList(req, res, [], pageSize, pageNo, count);
        }

        let sort = {};
        if (Sort !== null) {
            sort = clothHelpers.SortInCategory(Sort);
        }

        let rsp = await Cloth.find(query)
            .populate("category", "name _id")
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
            .sort(sort)
            .catch(error => { throw error; });

        return util.ReponseList(req, res, rsp, pageSize, pageNo, count);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};


const getCollection = async (req, res) => {
    try {

        let rsp = await Cloth
            .find({ isDeleted: { $ne: true }, isInCollection: true })
            .sort({ createdAt: -1 })
            .catch((error) => {
                throw error
            })
        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const getRecent = async (req, res) => {
    try {
        const { listCloth } = req.body;

        let rsp = await Cloth
            .find({
                _id: {
                    $in: listCloth.map(i => util.objectId(i))
                },
                isDeleted: { $ne: true }
            })
            .catch((error) => {
                throw error
            })

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

module.exports = {
    getOne,
    newArrival,
    getCartItems,
    getAvailableClothes,
    getClothesByCategory,
    getCollection,
    getRecent
}
