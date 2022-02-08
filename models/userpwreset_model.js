const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');

exports.insertPasswordRequest = async function (id, userId, expiryTime, keyCode, requestIP) {
    logger.debug("[userpwreset_model] ::insertPasswordRequest() : Start");
    var dbQuery = "INSERT INTO [user_reset_password] ( Id, UserId, ResetExpiryTime, KeyCode, RequestIp, IsActivated )" +
        " VALUES ('" + id + "', '" + userId + "', '" + expiryTime + "', '" + keyCode + "', '" + requestIP + "', '" + 0 + "')";
    var result = await db.query(dbQuery);
    logger.trace("[userpwreset_model] :: insertPasswordRequest() : End");
    return result.recordset;
};

exports.getPWResetData = async function (reqId, keyCode, deviceIp) {
    logger.debug("[userpwreset_model] ::getPWResetData() : Start");
    var dbQuery = "SELECT * FROM [user_reset_password] WHERE Id= '" + reqId + "' AND KeyCode= '" + keyCode + "' AND RequestIp= '" + deviceIp + "' AND IsActivated = '0'";
    var result = await db.query(dbQuery);
    logger.trace("[userpwreset_model] :: getPWResetData() : End");
    return result.recordset;
};

exports.getPWResetDataByReqId = async function (reqId, keyCode, deviceIp) {
    logger.debug("[userpwreset_model] ::getPWResetData() : Start");
    var dbQuery = "SELECT * FROM [user_reset_password] WHERE Id= '" + reqId + "' AND KeyCode= '" + keyCode + "' AND IsActivated = '0'";
    var result = await db.query(dbQuery);
    logger.trace("[userpwreset_model] :: getPWResetData() : End");
    return result.recordset;
};

exports.updateIsActivated = async function (reqId) {
    logger.debug("[userpwreset_model] ::updateIsActivated() : Start");
    var dbQuery = "UPDATE [user_reset_password] SET IsActivated= '1' WHERE Id= '" + reqId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[userpwreset_model] :: updateIsActivated() : End");
    return result.recordset;
};

exports.getUserIdByRequestId = async function (reqId) {
    logger.debug("[userpwreset_model] ::getUserIdByRequestId() : Start");
    var dbQuery = "SELECT * FROM [user_reset_password] WHERE Id= '" + reqId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[userpwreset_model] :: getUserIdByRequestId() : End");
    return result.recordset;
};

exports.updateResetPasswordByUserId = async function (userId) {
    logger.debug("[userpwreset_model] ::updateResetPasswordByUserId() : Start");
    var dbQuery = "UPDATE [user_reset_password] SET [IsActivated] = 1 WHERE UserId = '"+ userId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[userpwreset_model] :: updateResetPasswordByUserId() : End");
    return result.recordset;
}