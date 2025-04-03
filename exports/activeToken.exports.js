const jwt = require("jsonwebtoken")
const { BadRequestError } = require("./operationUtils")

const jwtSecret = process.env.JSON_SIGNATURE || "JXkWxYaqpvb90S-Z@sIoJxQyxS";

const generateEmployeeToken = async (entity) => {
    try {
        const bdy = {
            id: entity._id,
            email: entity.email,
            siteId: entity.siteId,
            roleCodes: [],
        }

        const token = await jwt.sign(bdy, jwtSecret, {
            expiresIn: parseInt(process.env.LOGIN_EXPIRE),
        })

        return "Bearer " + token
    } catch (error) {
        return ""
    }
}

const buildToken = async (auth = {
    id: null,
    email: null,
    siteId: null,
    usrname: null,
    type: null,
}) => {
    let expire = parseInt(process.env.LOGIN_EXPIRE);
    const token = await jwt.sign(auth, jwtSecret, {
        expiresIn: expire
    });
    return { token, expire }
}

/**
 * 管理员登陆后生成token
 * @param {adminInfos} entity
 * @returns
 */
const generateAdminToken = async (entity) => {
    const bdy = {
        id: entity._id,
        email: entity.email,
        name: entity.name,
    }

    const token = await jwt.sign(bdy, jwtSecret, {
        expiresIn: parseInt(process.env.LOGIN_EXPIRE),
    })

    return "Bearer " + token
}

const verifyToken = (token) => {
    token = String(token).replace("Bearer ", "");
    return new Promise((r, j) => {
        jwt.verify(token, jwtSecret, (err, data) => {
            if (err) {
                log.error('Token信息错误', err);
                j(new BadRequestError());
            } else {
                r(data);
            }
        });
    });
}

const delayToken = async (data) => {
    let now = (timestamp = new Date().getTime())

    if (data.exp - parseInt(now / 1000) < 30 * 60) {
        return generateEmployeeToken({
            _id: data._id,
            firstName: data.firstName,
            siteId: data.siteId,
        })
    }

    return ""
}

module.exports = {
    buildToken,
    generateEmployeeToken,
    verifyToken,
    delayToken,
    generateAdminToken,
}
