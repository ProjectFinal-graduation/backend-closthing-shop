const { pacsdb, mongoose, refTable } = require("./connection")

const ProvinceSchema = mongoose.Schema(
    {
        name_kh: String,
        name_en: String,
        deliveryFee: Number
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = pacsdb.model("provinces", ProvinceSchema)
