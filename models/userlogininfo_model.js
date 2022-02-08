const uuidv1 = require('uuid/v1');
const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');

exports.getUserLoginInfo = async function (userId, deviceId) {
    logger.debug("[userlogininfo_model] :: getUserLoginInfo() : Start");
    var dbQuery = "SELECT TOP 1 * FROM [user_info] WHERE UserId= '" + userId + "' AND DeviceId=  '" + deviceId + "' ORDER BY LastAccessTime DESC";
    var result = await db.query(dbQuery);
    logger.trace("[userlogininfo_model] :: getUserLoginInfo() : End");
    return result.recordset;
};

exports.insertUserLoginInfo = async function (id, userId, deviceId, refreshToken, expiryTime, lastAccessTime) {
    logger.debug("[userlogininfo_model] :: insertUserLoginInfo() : Start");
    var dbQuery = "INSERT INTO [user_info] ( Id, UserId, DeviceId, RefreshToken, SessionExpiryTime, LastAccessTime )" +
        " VALUES ('" + id + "', '" + userId + "', '" + deviceId + "', '" + refreshToken + "', '" + expiryTime + "', '" + lastAccessTime + "')";
    var result = await db.query(dbQuery);
    logger.trace("[userlogininfo_model] :: insertUserLoginInfo() : End");
    return result.recordset;
};

exports.updateUserLoginInfo = async function (id, expiryTime, lastAccessTime) {
    logger.debug("[userlogininfo_model] :: getUserLoginInfo() : Start");
    var dbQuery = "UPDATE [user_info] SET SessionExpiryTime= '" + expiryTime + "', LastAccessTime= '" + lastAccessTime + "' WHERE Id= '" + id + "'";
    var result = await db.query(dbQuery);
    logger.trace("[userlogininfo_model] :: getUserLoginInfo() : End");
    return result.recordset;
};

exports.getUserLoginInfoByUserId = async function (userId) {
    logger.debug("[userlogininfo_model] :: getUserLoginInfo() : Start");
    var dbQuery = `SELECT Id FROM [user_info] WHERE UserId = '${userId}'`;
    var result = await db.query(dbQuery);
    logger.trace("[userlogininfo_model] :: getUserLoginInfo() : End");
    return result.recordset;
}