const { pacsdb, mongoose } = require("./connection")
const validator = require("validator")
const baseState = require("../state/base")
const { roles } = require("../state/user");

// Employee account
const UserSchema = mongoose.Schema(
    {
        code: {
            type: String,
            unique: true,
            trim: true,
            required: [true, "Code must not empty"],
        },
        role: {
            type: String,
            validate: {
                validator: function (v) {
                    return new RegExp("^(" + baseState.getStateStr(roles) + ")$").test(v)
                },
                message: "Invalid roles",
            },
            required: [true, "roles must not empty"],
        },
        email: {
            type: String,
            required: [true, "Email must not be null"],
            validate: {
                validator: function (v) { return validator.isEmail(v); },
                message: "{VALUE} is not a valid Email!",
            },
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Username must not be null"],
        },
        password: {
            type: String,
            required: [true, "Password must not be null"],
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number must not be null"],
            trim: true,
        },
        chatId: {
            type: String,
            trim: true,
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

UserSchema.pre('save', async function (next) {
    
    next();
})
UserSchema.pre('updateOne', async function (next) {
    const data = this.getUpdate();
    
    next();
})

module.exports = pacsdb.model("users", UserSchema)
