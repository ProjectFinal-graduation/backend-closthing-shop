
module.exports = {
    //登陆
    BAD_REQUEST: {
        errorCode: 940000,
        status: 400,
        message: "Bad request",
    },
    UNAUTHORIZED: {
        errorCode: 940100,
        status: 401,
        message: "Unauthorized or Expired Token. Please Login and Try Again Later",
    },
    PUBLIC_UNAUTHORIZED: {
        errorCode: 940103,
        status: 401,
        message: "Public Access Unauthorized Token. Please Try Again Later",
    },
    NO_TOKEN: { errorCode: 940101, status: 401, message: "No token" },
    TOKEN_ERROR: { errorCode: 940102, status: 401, message: "Token error" },

    FORBIDDEN: { errorCode: 940300, status: 403, message: "Forbidden" },
    NOT_FOUND: { errorCode: 940400, status: 404, message: "Not found" },
    SERVER: { errorCode: 950000, status: 500, message: "Server error" },
    PARAMETER_ERROR: { errorCode: 960000, status: 403, message: "Parameters must not null!" },
    PARAM_VALUE_ERROR: { errorCode: 960001, status: 403, message: "Parameter key ${0} value not equal ${1}." },
    PARAM_NOT_NULL: { errorCode: 960002, status: 403, message: "Parameter key ${0} must not null." },

    //
    GENERATE_TOKEN_ERROR: { errorCode: 100003, status: 400, message: "Cannot Sign JWT Token" },
    WRONG_USERNAME_PASSWORD: { errorCode: 100002, status: 400, message: "Invalid username / password" },
    GENERATE_SERVER_ERROR: { errorCode: 100004, status: 500, message: "Internal Server Error" },
    GENERATE_PARAMETERS_ERROR: { errorCode: 100005, status: 400, message: "Error in request parameters" },

    ADD_FAILED: { errorCode: 100006, status: 400, message: "Add Failed" },
    CREATE_FAILED: { errorCode: 100006, status: 400, message: "Create Failed" },
    UPDATE_FAILED: { errorCode: 100007, status: 400, message: "Update Failed" },
    NOT_EXIST: { errorCode: 100025, status: 404, message: "Not exist" },
    DELETE_FAILED: { errorCode: 100007, status: 400, message: "Delete Failed" },

    EMAIL_EXIST: { errorCode: 100006, status: 400, message: "Email already exist!" },

    COLLECTION_404: { errorCode: 940400, status: 404, message: "Collection Not found" },
    MODEL_404: { errorCode: 940400, status: 404, message: "Model Not found" },
    USER_404: { errorCode: 940400, status: 404, message: "User Not found" },
    CATEGORY_404: { errorCode: 940400, status: 404, message: "Category Not found" },
    PROVINCE_404: { errorCode: 940400, status: 404, message: "Province Not found" },
    CATEGORY_PARENT_404: { errorCode: 940400, status: 404, message: "Category parent Not found" },
    EMAIL_PASSWORD_404: { errorCode: 940400, status: 404, message: "Incorrect Email or Password" },
    CLOTH_404: { errorCode: 940400, status: 404, message: "Cloth Not found" },


    ORDER_CREATE_FAILED: { errorCode: 100006, status: 400, message: "Order Create Failed" },
    MISSING_REQUIRED_FIELDS: { errorCode: 100006, status: 400, message: "Missing Required Fields" },
    ORDER_NOT_FOUND: { errorCode: 100025, status: 404, message: "Order Not Found" },
    ORDER_NOT_PAID: { errorCode: 100025, status: 404, message: "Order not paid yet" },
    ORDER_NOT_DELIVERY: { errorCode: 100025, status: 404, message: "Order not delivered yet" },
}
