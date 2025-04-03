const Cloth = require("../../../models/cloth");
const Model = require("../../../models/model");
const Category = require("../../../models/category");
const util = require("../../../exports/util");
const literal = require("../../../exports/literal");
const serviceUtils = require("../../../exports/serviceUtils");
const ERROR_CODES = require("../../../errorcodes/index.code");
const errorUtils = require("../../../exports/errorUtils");
const {
  uploadImages,
  deleteImage,
} = require("../../../services/uploadImage.services");
const {getClothCode} = require("../../../services/user.services");
const create = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      discount,
      categoryId,
      sizes,
      modelId,
      code,
    } = req.body;
    const images = req.files;
    const model = await Model.findById(modelId);
    serviceUtils.throwBadRequestWhenEmpty(model, ERROR_CODES.BAD_REQUEST);
    const category = await Category.findById(categoryId);
    serviceUtils.throwBadRequestWhenEmpty(category, ERROR_CODES.BAD_REQUEST);

    console.log("category", category);
    console.log("model", model);

    let imageUrls = [];
    if (images && images.length > 0) {
      const uploadedUrls = await uploadImages(
        images.map((file) => ({
          fileName: file.originalname,
          contentType: file.mimetype,
          data: file.buffer,
        })),
        "cloth-images",
        category.code,
        code
      ); //Passing folder structure in S3 here

      imageUrls = uploadedUrls;
    }

    const data = {
      name,
      price,
      description,
      discount,
      category,
      imagePaths: imageUrls,
      sizes,
      model,
      id: await getClothCode(),
      code,
    };
    console.log("data", data);
    const SIZE = literal.SIZE;
    for (const sizeId of sizes) {
      if (!Object.values(SIZE).includes(sizeId)) {
        return util.ResFail(req, res, ERROR_CODES.BAD_REQUEST);
      }
    }

    const newCloth = new Cloth(data);
    const rsp = await newCloth.save();
    serviceUtils.throwBadRequestWhenEmpty(rsp, ERROR_CODES.CREATE_FAILED);

    return util.ReponseSuss(req, res, rsp);
  } catch (error) {
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};
const list = async (req, res) => {
  try {
    let pageNo = util.defaultPageNo(req.query.pageNo);
    let pageSize = util.defaultPageSize(req.query.pageSize);
    let searchQuery = req.query.search || "";

    let query = { isDeleted: { $ne: true } };
    if (searchQuery) {
      query.$or = [
        { id: { $regex: searchQuery, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } },
        { code: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    let count = await Cloth.countDocuments(query);
    
    
    if (count === 0) {
      return util.ReponseList(req, res, [], pageSize, pageNo, count);
    }

    const cloths = await Cloth.find(query)
      .populate({
        path: "category",
        select: "name code _id",
      })
      .populate({
        path: "model",
        select: "-clothes",
      })
      .skip((pageNo - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return util.ReponseList(req, res, cloths, pageSize, pageNo, count);
  } catch (error) {
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const getOne = async (req, res) => {
  console.log("Get one cloth");
  try {
    const id = req.params.id;
    const cloth = await Cloth.findById(id)
      .populate({
        path: "category",
        select: "name code _id",
      })
      .populate({
        path: "model",
        select: "-clothes",
      });

    serviceUtils.throwNotFoundWhenEmpty(cloth, ERROR_CODES.CLOTH_404);
    return util.ReponseSuss(req, res, cloth);
  } catch (error) {
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

const update = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      discount,
      categoryId,
      sizes,
      modelId,
      code,
      imagePaths: newImagePaths,
    } = req.body;
    const images = req.files;
    const clothId = req.params.id;
    // Find the existing cloth item by ID
    const existingCloth = await Cloth.findById(clothId);
    serviceUtils.throwBadRequestWhenEmpty(
      existingCloth,
      ERROR_CODES.BAD_REQUEST,
      `Cloth not found, invalid ID provided ${clothId}`
    );

    // Find the category and model to validate and potentially update
    const model = await Model.findOne({ _id: util.objectId(modelId) });
    serviceUtils.throwBadRequestWhenEmpty(
      model,
      ERROR_CODES.BAD_REQUEST,
      `Model not found, invalid ID provided ${modelId}`
    );

    const category = await Category.findById(categoryId);
    serviceUtils.throwBadRequestWhenEmpty(
      category,
      ERROR_CODES.BAD_REQUEST,
      `Category not found, invalid ID provided ${categoryId}`
    );

    // Validate sizes
    console.log("newImagePaths = ", newImagePaths);
    console.log(sizes);
    // Get the current image paths from the existing cloth item
    const currentImagePaths = existingCloth.imagePaths || [];
    const imagesToDelete = currentImagePaths.filter(
      (path) => !newImagePaths.includes(path)
    );
    const imagesToKeep = currentImagePaths.filter((path) =>
      newImagePaths.includes(path)
    );

    // Delete any images that are in the current list but not in the new list
    for (const imagePath of imagesToDelete) {
      await deleteImage(
        imagePath.replace(
          `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`,
          ""
        )
      );
    }

    // Upload new images if provided
    let uploadedUrls = [];
    if (images && images.length > 0) {
      const newImages = images.map((file) => ({
        fileName: file.originalname,
        contentType: file.mimetype,
        data: file.buffer,
      }));

      uploadedUrls = await uploadImages(
        newImages,
        "cloth-images",
        category.code,
        code
      );
    }

    // Combine the images to keep and newly uploaded URLs
    const finalImageUrls = [...imagesToKeep, ...uploadedUrls];

    // Update cloth data
    const updateData = {
      name,
      price,
      description,
      discount,
      category,
      imagePaths: finalImageUrls,
      sizes,
      model,
      code,
    };

    // Update cloth in database
    const updatedCloth = await Cloth.findByIdAndUpdate(clothId, updateData, {
      new: true,
    });
    serviceUtils.throwBadRequestWhenEmpty(
      updatedCloth,
      ERROR_CODES.UPDATE_FAILED
    );

    return util.ReponseSuss(req, res, updatedCloth);
  } catch (error) {
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};
const destory = async (req, res) => {
  try {
    const id = req.params.id;
    const cloth = await Cloth.findById(id);
    serviceUtils.throwNotFoundWhenEmpty(cloth, ERROR_CODES.CLOTH_404);
    cloth.isDeleted = true; // Soft delete Not sure if should be hard delete
    cloth.isAvailable = false;
    cloth.save();
    return util.ReponseSuss(req, res, cloth, "Deleted Successfully");
  } catch (error) {
    return util.ResFail(req, res, errorUtils.ErrorHelper(error));
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  destory,
};
