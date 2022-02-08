const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');

exports.insertRFQProjectType = async function (id, rfqId, projectTypeId) {
    logger.debug("[rfqprojecttypemodel] :: insertRFQProjectType() : Start");    
    var dbQuery = "INSERT INTO [RFQ_project_type] (Id, RFQId, ProjectTypeId)" +
        " VALUES ('" + id + "', '" + rfqId + "', '" + projectTypeId + "')";
        console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[rfqprojecttypemodel] :: insertRFQProjectType() : End");
    return result.recordset;
}
