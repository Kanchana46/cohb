const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');

exports.insertLetterOfClarification = async function (id, description) {
    logger.debug("[letterofclarification] :: insertLetterOfClarification() : Start");    
    var dbQuery = "INSERT INTO [letter_of_clarification] (Id, Description)" +
        " VALUES ('" + id + "', '" + description + "' )";
    var result = await db.query(dbQuery);
    logger.trace("[letterofclarification] :: insertLetterOfClarification() : End");
    return result.recordset;
}

exports.insertRFQLC = async function (id, RFQId, LCId) {
    logger.debug("[letterofclarification] :: insertRFQLC() : Start");    
    var dbQuery = "INSERT INTO [RFQ_letter_of_clarification] (Id, RFQId, LClarificationId)" +
        " VALUES ('" + id + "', '" + RFQId + "', '" + LCId + "' )";
    var result = await db.query(dbQuery);
    logger.trace("[letterofclarification] :: insertRFQLC() : End");
    return result.recordset;
}