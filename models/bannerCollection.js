const { pacsdb, mongoose, refTable } = require("./connection")

const CategorySchema = mongoose.Schema(
    {
        imagePath: String,
        isPcBanner: {
            type: Boolean,
            default: false
        },
        category: refTable("categories"),
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = pacsdb.model("banner_collections", CategorySchema)
