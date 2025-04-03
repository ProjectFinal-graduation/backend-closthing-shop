const BannerCollection = require("../../../models/bannerCollection")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');
const {validateImageAspectRatio, uploadImages, deleteImage} = require("../../../services/uploadImage.services");
const category = require("../../../models/category");

const create = async (req, res) => {
    try {
        const { isPcBanner, categoryId } = req.body;
        let imageURL;

        if (req.file) {
            const isValidSize = await validateImageAspectRatio(req.file.buffer);
            if (!isValidSize) {
                return util.ResFail(req, res, ERROR_CODES.BAD_REQUEST, "Banner image aspect ratio is not valid");
            }

            const uploadPath = isPcBanner ? "PC_Banner" : "Mobile_Banner";
            imageURL = await uploadImages([{
                fileName: req.file.originalname,
                contentType: req.file.mimetype,
                data: req.file.buffer,
            }], "bannerCollection", uploadPath);
        }

        const bannerCollection = new BannerCollection({
            isPcBanner,
            category: categoryId,
            imagePath: imageURL[0]
        });

        const rsp = await bannerCollection.save();
        return util.ReponseSuss(req, res, rsp, "Banner collection created successfully");

    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};


const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPcBanner, categoryId } = req.body;
        const { file } = req;
        let imageURL;

        const bannerCollection = await BannerCollection.findById(id);
        if (!bannerCollection) {
            return util.ResFail(req, res, ERROR_CODES.NOT_FOUND, "Banner collection not found");
        }

        if (isPcBanner !== undefined) {
            bannerCollection.isPcBanner = isPcBanner;
        }
        if (categoryId) {
            bannerCollection.category = categoryId;
        }

        if (file) {
            const isValidSize = await validateImageAspectRatio(file.buffer);
            if (!isValidSize) {
                return util.ResFail(req, res, ERROR_CODES.BAD_REQUEST, "Banner image aspect ratio is not valid");
            }

            const uploadPath = isPcBanner ? "PC_Banner" : "Mobile_Banner";
            imageURL = await uploadImages([{
                fileName: file.originalname,
                contentType: file.mimetype,
                data: file.buffer,
            }], "bannerCollection", uploadPath);

            bannerCollection.imagePath = imageURL[0];

            await deleteImage(bannerCollection.imagePath);
        }

        // Save the updated entry
        const rsp = await bannerCollection.save();
        return util.ReponseSuss(req, res, rsp, "Banner collection updated successfully");

    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};


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
            .find(query)
            .populate("category")
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

        let rsp = await BannerCollection.findOne({ _id: util.objectId(id) })
            .populate("category")
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.COLLECTION_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}

const destory = async (req, res) => {
    try {
        let id = req.params.id

        const rsp = await BannerCollection.updateOne({ _id: util.objectId(id) }, { $set: { isDeleted: true } })
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
