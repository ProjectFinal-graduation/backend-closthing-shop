const { pacsdb, mongoose, refTable } = require("./connection")
const baseState = require("../state/base")
const { sizes } = require("../state/size");

const ClothSchema = mongoose.Schema(
    {
        id: String,
        name: String,
        code: String,
        description: String,
        price: Number,
        discount: Number,
        category: refTable("categories"),
        model: refTable("models"),
        imagePaths: [String],
        sizes: [{
            type: String,
            validate: {
                validator: function (v) {
                    return new RegExp("^(" + baseState.getStateStr(sizes) + ")$").test(v)
                },
                message: "Invalid sizes",
            },
        }],
        order: [refTable("orders")],
        isDeleted: {
            type: Boolean,
            default: false
        },
        isInCollection: {
            type: Boolean,
            default: false
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = pacsdb.model("clothes", ClothSchema)
