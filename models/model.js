const { pacsdb, mongoose, refTable } = require("./connection")
const baseState = require("../state/base")
const { sizes } = require("../state/size");

const ModelSchema = mongoose.Schema(
    {
        name: String,
        age: Number,
        height: Number,
        weight: Number,
        top: {
            type: String,
            validate: {
                validator: function (v) {
                    return new RegExp("^(" + baseState.getStateStr(sizes) + ")$").test(v)
                },
                message: "Invalid sizes",
            },
        },
        bottom: {
            type: String,
            validate: {
                validator: function (v) {
                    return new RegExp("^(" + baseState.getStateStr(sizes) + ")$").test(v)
                },
                message: "Invalid sizes",
            },
        },
        profilePicture: String,
        clothes: [refTable("categories")],
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

module.exports = pacsdb.model("models", ModelSchema)
