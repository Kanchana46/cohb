const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const uuidv1 = require('uuid/v1');
var bcrypt = require('bcryptjs');
const util = require('../util/basicutil')
   
exports.saveProjectType = async function (projectType) {
    logger.debug("[project_type_model] :: saveProjectType() : Start");
    var Id = uuidv1() 
    var dbQuery = "INSERT INTO [dbo].[project_type] ([Id], [Type], [Status])" +
        "VALUES ('" + Id +
        "', '" + util.replaceQuotes(projectType.type) +
        "', " + projectType.status + ");";
    var result = await db.query(dbQuery);
    logger.trace("[project_type_model] :: saveProjectType() : End");
    return result.recordset;
}

exports.getAllProjectTypes = async function () {
    logger.debug("[project_type_model] :: getAllProjectTypes() : Start");
    var dbQuery = "SELECT * FROM [project_type] ORDER BY Number";
    var result = await db.query(dbQuery);
    logger.trace("[project_type_model] :: getAllProjectTypes() : End");
    return result.recordset;
}

exports.updateProjectTypeStatusById = async function (id, status) {
    logger.debug("[project_type_model] :: updateProjectTypeStatusById() : Start");
    var dbQuery = "UPDATE [project_type] SET Status= " + status + " WHERE Id= '" + id + "'";
    var result = await db.query(dbQuery);
    logger.trace("[project_type_model] :: updateProjectTypeStatusById() : End");
    return result.recordset;

}

exports.updateProjectTypeById = async function (id, type) {
    logger.debug("[project_type_model] :: updateProjectTypeById() : Start");
    var dbQuery = "UPDATE [project_type] SET Type= '" + type + "' WHERE Id= '" + id + "'";
    var result = await db.query(dbQuery);
    logger.trace("[project_type_model] :: updateProjectTypeById() : End");
    return result.recordset;

}

exports.checkProjectTypeAvailability = async function (inputValue) {
    logger.debug("[project_type_model] :: checkProjectTypeAvailability() : Start");
    var dbQuery = 'SELECT "projectTypeAvailable" = CASE WHEN NumberofTypes = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofTypes FROM (SELECT [Id] FROM [project_type] WHERE Type= \'' + util.replaceQuotes(inputValue) + '\') AS y) AS x';
    var result = await db.query(dbQuery, [inputValue]);
    logger.trace("[project_type_model] :: checkProjectTypeAvailability() : End");
    return result.recordset;
};

exports.getProjectTypeByNumber = async function(number) {
    logger.debug("[project_type_model] :: getProjectTypeByNumber() : Start");
    var dbQuery = "SELECT * FROM [project_type] WHERE Number= " + number ;
    console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[project_type_model] :: getProjectTypeByNumber() : End");
    return result.recordset; 
}

exports.getProjectTypesByStatus = async function (status) {
    logger.debug("[project_type_model] :: getProjectTypesByStatus() : Start");
    var dbQuery = "SELECT * FROM [project_type] WHERE Status = " + status + " ORDER BY Type" ;
    var result = await db.query(dbQuery);
    logger.trace("[project_type_model] :: getProjectTypesByStatus() : End");
    return result.recordset;
}

exports.getProjectTypeByStatus = async function(number) {
    logger.debug("[project_type_model] :: getProjectTypeByStatus() : Start");
    var dbQuery = "SELECT * FROM [project_type] WHERE Status='1' AND Number= " + number ;
    console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[project_type_model] :: getProjectTypeByStatus() : End");
    return result.recordset; 
}