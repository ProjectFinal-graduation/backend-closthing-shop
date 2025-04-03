const util = require("../exports/util")

/**
 * 检查相应的状态机是否能修改为某一个状态
 * 目标状态不能为空
 * @param stateModel
 * @param {*} thisStatus
 * @param {*} targetStatus
 * @return {Boolean}
 */
function canChange(stateModel, thisStatus, targetStatus) {
    thisStatus = String(thisStatus)
    targetStatus = String(targetStatus)
    if (targetStatus === "") {
        return false
    }

    if (thisStatus !== "") {
        thisStatus = util.toLowerFirst(thisStatus)
    }

    targetStatus = util.toLowerFirst(targetStatus)

    if (util.isEmpty(stateModel.states)) {
        return false
    }

    if (thisStatus === targetStatus) {
        return true
    }

    if (!stateModel.states[thisStatus] || stateModel.states[thisStatus].length === 0) {
        return false
    }

    if (util.isNumic(targetStatus)) {
        targetStatus = Number(targetStatus)
        thisStatus = Number(thisStatus)
    }

    if (stateModel.states[thisStatus].indexOf(targetStatus) >= 0) {
        return true
    }

    return false
}

/**
 * 当状态机的状态产生了变化，自动执行相应的事件,
 * 建议在model的勾子函数里调用执行
 * 注意:状态在修改前和修改后的值相同，则不会执行相应的方法
 * @param id
 * @param stateModel
 * @param {*} thisStatus
 * @param {*} targetStatus
 */
function doEvent(id, stateModel, thisStatus, targetStatus) {
    thisStatus = String(thisStatus)
    targetStatus = String(targetStatus)

    if (thisStatus !== "") {
        thisStatus = util.toLowerFirst(thisStatus)
    }

    if (targetStatus !== "") {
        targetStatus = util.toLowerFirst(targetStatus)
    }

    if (thisStatus === targetStatus) {
        return true
    }

    try {
        stateModel.init()
        stateModel[createfunction(targetStatus)](id)
    } catch (error) {
        console.info("state call func is err:", error.message)
    }
}

/**
 * 获取默认的状态值
 */
function getDefault(stateModel) {
    return stateModel.defaultState ? stateModel.defaultState : ""
}

//获取所有一个状态机所支持的状态列表(数组)
function getStates(stateModel, key = "") {
    if (util.isEmpty(stateModel.states)) {
        return []
    }
    if (key !== "") {
        if (stateModel.states[key]) {
            return stateModel.states[key]
        }
        return []
    }

    let rsp = []
    for (x in stateModel.states) {
        rsp.push(x)
    }

    return rsp
}

/**
 * 获取： 从哪些状态可以变更到目标状态
 * @param {*} stateModel
 * @param {*} targetStatus
 * @return {[]}
 */
function getStateOfFrom(stateModel, targetStatus) {
    let rsp = []
    for (x in stateModel.states) {
        if (stateModel.states[x].indexOf(targetStatus) >= 0) {
            rsp.push(x)
        }
    }
    return rsp
}

//获取所有一个状态机所支持的状态列表(String)
function getStateStrItem(stateModel, implodeStr = "|", key = "") {
    if (util.isEmpty(stateModel)) {
        return ""
    }
    if (key !== "") {
        if (stateModel[key]) {
            return stateModel[key].join(implodeStr)
        }
        return ""
    }
    let rsp = []
    for (let x in stateModel) {
        rsp.push(x)
    }
    return rsp.join(implodeStr)
}

//获取所有一个状态机所支持的状态列表(String)
function getStateStr(stateModel, implodeStr = "|", key = "") {
    if (util.isEmpty(stateModel.states)) {
        return ""
    }
    if (key !== "") {
        if (stateModel.states[key]) {
            return stateModel.states[key].join(implodeStr)
        }
        return ""
    }

    let rsp = []
    for (let x in stateModel.states) {
        rsp.push(x)
    }

    return rsp.join(implodeStr)
}

function createfunction(targetStatus) {
    let temps = String(targetStatus).split(" ")
    for (let i = 0; i < temps.length; i++) {
        temps[i] = util.toUpperFirst(temps[i])
    }
    return "event" + temps.join("")
}

function formatObjKeys(obj, str = "|") {
    let arr = []
    for (const k in obj) {
        arr.push(k)
    }
    return arr.join(str)
}

module.exports = {
    formatObjKeys,
    canChange,
    doEvent,
    getStates,
    getStateStr,
    getDefault,
    getStateOfFrom,
    getStateStrItem,
}
