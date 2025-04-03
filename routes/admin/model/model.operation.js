const Models = require("../../../models/model")
const util = require("../../../exports/util")
const serviceUtils = require('../../../exports/serviceUtils')
const ERROR_CODES = require('../../../errorcodes/index.code')
const errorUtils = require('../../../exports/errorUtils');
const { uploadImages, deleteImage } = require("../../../services/uploadImage.services");


const create = async (req, res) => {
    try {
        const { name, age, height, weight, top, bottom } = req.body;

        if (!name || !age || !height || !weight || !top || !bottom) {
            return util.ResFail(req, res, ERROR_CODES.MODEL_CREATE_FAILED);
        }

        let image = null;

        // Check if a single file is uploaded
        if (req.file) {
            image = await uploadImages([{
                fileName: req.file.originalname,
                contentType: req.file.mimetype,
                data: req.file.buffer,
            }], "models");
        }

        const model = new Models({
            name: name,
            age: age,
            height: height,
            weight: weight,
            top: top,
            bottom: bottom,
            profilePicture: image[0]
        });

        const rsp = await model.save();
        return util.ReponseSuss(req, res, rsp, "Created Successfully");

    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, height, weight, top, bottom } = req.body;
        const model = await Models.findById(id);
        if (!model) {
            return util.ResFail(req, res, ERROR_CODES.NOT_FOUND);
        }


        if (name) model.name = name;
        if (age) model.age = age;
        if (height) model.height = height;
        if (weight) model.weight = weight;
        if (top) model.top = top;
        if (bottom) model.bottom = bottom;

        if (req.file) {
            const image = await uploadImages([{
                fileName: req.file.originalname,
                contentType: req.file.mimetype,
                data: req.file.buffer,
            }], "models");

            model.profilePicture = image[0]; 

            // Delete old image
            if (model.profilePicture) {
                await deleteImage(model.profilePicture);
            }
        }

        const rsp = await model.save();
        return util.ReponseSuss(req, res, rsp, "Updated Successfully");

    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
}


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
            .catch((error) => { throw error });

        serviceUtils.throwNotFoundWhenEmpty(rsp, ERROR_CODES.MODEL_404);

        return util.ReponseSuss(req, res, rsp);
    } catch (error) {
        return util.ResFail(req, res, errorUtils.ErrorHelper(error))
    }
}
const destory = async (req, res) => {
    try {
        let id = req.params.id

        const rsp = await Models.updateOne({ _id: util.objectId(id) }, { $set: { isDeleted: true } })
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
