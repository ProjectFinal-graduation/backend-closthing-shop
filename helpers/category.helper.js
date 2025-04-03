const lookUpParent = {
    $lookup: {
        from: "categories",
        localField: "parent",
        foreignField: "_id",
        pipeline: [
            { $match: { isDeleted: { $ne: true } } }
        ],
        as: "parent"
    }
};

const lookUpCategory = [{
    $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        pipeline: [{
            $match: { isDeleted: { $ne: true } }
        }, {
            $lookup: {
                from: "categories",
                localField: "parent",
                foreignField: "_id",
                pipeline: [{
                    $match: { isDeleted: { $ne: true } }
                }],
                as: "parent"
            }
        }, {
            $unwind: {
                path: "$parent",
                preserveNullAndEmptyArrays: true
            }
        }],
        as: "category",
    }
}, {
    $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true
    }
}];

const lookUpChild = {
    $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "parent",
        pipeline: [
            { $match: { isDeleted: { $ne: true } } }
        ],
        as: "childs"
    }
}

module.exports = {
    lookUpChild,
    lookUpParent,
    lookUpCategory
}