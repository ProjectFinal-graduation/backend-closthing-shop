const { pacsdb, mongoose, refTable } = require("./connection")

const CategorySchema = mongoose.Schema(
    {
        name: String,
        code: String,
        parent: refTable("categories"),
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = pacsdb.model("categories", CategorySchema)