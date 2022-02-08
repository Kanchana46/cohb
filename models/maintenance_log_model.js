const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');

exports.getMaintenanceData = async function() {
    logger.debug("[maintenance_log_model] :: getMaintenanceData() : Start");
    var dbQuery = "SELECT * FROM [server_maintenance_log]";
    var result = await db.query(dbQuery);
    logger.trace("[maintenance_log_model] :: getMaintenanceData()  : End");
    return result.recordset;
}