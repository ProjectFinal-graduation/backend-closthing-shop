const { UNAUTHORIZED, BAD_REQUEST, FORBIDDEN, SERVER, NOT_FOUND } = require("../errorcodes/index.code");
const util = require("./util")
const contextUtils = require('./contextUtils')
const serviceUtils = require('./serviceUtils')
const errorUtils = require('./errorUtils');
const { CommonError,
    BadRequestError,
    NotFoundError,
    AuthorizationError,
    ForbiddenError } = errorUtils;


const resultDeal = (cb) => {
    return async (req, res, next) => {
        await contextUtils.run(async () => {
            // let trackId = `${new Date().getTime()}${idUtils.countId()}${Math.floor(Math.random() * 1000)}`;
            // contextUtils.put('fwTrack', trackId);
            // contextUtils.put('httpReq', req);
            // contextUtils.put('httpRes', res);

            try {
                let result = await cb(req, res, next);
                result = result === undefined ? null : result;
                if (result instanceof RespResult && result._fw_not_response) {
                    return;
                }

                if (result instanceof RespResult) {
                    res.send(result);
                    return;
                }
                if (result instanceof ResultList) {
                    return util.ReponseList(req, res, result.data, result.pageSize, result.pageNo, result.total, result.averageTime);
                } else {
                    return util.ReponseSuss(req, res, result);
                }
            } catch (err) {
                let result = { ...SERVER }
                if (err instanceof BadRequestError) {
                    result = { ...BAD_REQUEST };
                } else if (err instanceof AuthorizationError) {
                    result = { ...UNAUTHORIZED };
                } else if (err instanceof ForbiddenError) {
                    result = { ...FORBIDDEN };
                } else if (err instanceof NotFoundError) {
                    result = { ...NOT_FOUND };
                } else if (err instanceof CommonError) {
                    result = { ...SERVER };
                }
                {
                    let code = err.code;
                    if (code) {
                        if (typeof code == 'object') {
                            result = code;
                        } else {
                            result.errorCode = code ? code : result.errorCode;
                        }
                    }
                    result.message = err.message ? err.message : result.message;
                }
                result.errorData = err.errorData;
                return res.send(result);
            }
        });
    };
}

// {
//     id: user._id,
//     email: user.email,
//     siteId: user.siteId,
//     type: 'token',
//     roleCodes
// }
/**
 * 
 * @param {any} req 
 * @param {boolean} info 
 * @returns {Promise<{id:string, siteId:string, email:string, roleCodes:string[]}>}
 */
const getUser = async (req, info = false) => {
    let auth = require('../middleware/validate.middleware').getAuth(req);
    if (info) {
        return auth ? auth.user : null;
    } else {
        return auth ? auth.tokenMsg : null;
    }
}


class RespResult {
    constructor(data = {
        _fw_not_response: false,
        status: 200,
        message: `Successfully`,
        total: null,
        pageSize: null,
        pageNo: null,
        data: null,
    }) {
        this.status = data.status;
        this.message = data.message;
        this.total = data.total;
        this.pageSize = data.pageSize;
        this.pageNo = data.pageNo;
        this.data = data.data;
        this._fw_list = true;
        this._fw_consoller = true;
        this._fw_not_response = data._fw_not_response;
    }
}
class ResultList {
    constructor(data, param = { total: null, pageSize: null, pageNo: null, averageTime: null }) {
        this.data = data;
        if (param != null) {
            this.total = param.total;
            this.pageSize = param.pageSize;
            this.pageNo = param.pageNo;
            this.averageTime = param.averageTime;
        }
    }
}


module.exports = {
    ...serviceUtils,

    resultDeal,

    getUser,

    ResultList,
    RespResult,

    ...errorUtils,
}

