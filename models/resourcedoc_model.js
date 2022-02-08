const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');

exports.insertResourceDoc = async function (id, name, vendorType) {
    logger.debug("[resourcedoc_model] :: insertResourcePSDoc() : Start");
    var dbQuery
    if (vendorType == 'psVendor') {
        dbQuery = "INSERT INTO [professional_service_document] (Id, Name)" +
            " VALUES ('" + id + "', '" + name.replace("'", "''") + "')"
    } else {
        dbQuery = "INSERT INTO [construction_service_document] (Id, Name)" +
            " VALUES ('" + id + "', '" + name.replace("'", "''") + "')"
    }
    var result = await db.query(dbQuery);
    logger.trace("[resourcedoc_model] :: insertResourcePSDoc() : End");
    return result.recordset;
}

exports.getResouceDocByName = async function (name, vendorType) {
    logger.debug("[resourcedoc_model] :: getResouceDocByName() : Start");
    var dbQuery
    if (vendorType == 'psVendor') {
        dbQuery = "SELECT * FROM [professional_service_document] WHERE Name= '" + name.replace("'", "''") + "'";
    } else {
        dbQuery = "SELECT * FROM [construction_service_document] WHERE Name= '" + name.replace("'", "''") + "'";
    }
    var result = await db.query(dbQuery);
    logger.trace("[resourcedoc_model] :: getResouceDocByName() : End");
    return result.recordset;
}

exports.deleteResourceDoc = async function (resourceDocId, vendorType) {
    logger.debug("[resourcedoc_model] :: deleteResourceDoc() : Start");
    var dbQuery
    if (vendorType == 'psVendor') {
        dbQuery = "DELETE FROM [professional_service_document] WHERE Id= '" + resourceDocId + "'"
    } else {
        dbQuery = "DELETE FROM [construction_service_document] WHERE Id= '" + resourceDocId + "'"
    }
    var result = await db.query(dbQuery);
    logger.trace("[resourcedoc_model] :: deleteResourceDoc() : End");
    return result.rowsAffected[0];
}


exports.getResourceDocumentById = async function (Id, vendorType) {
    logger.debug("[resourcedoc_model] :: getResourceDocumentById() : Start");
    let table = '';
    if (vendorType == 'psVendor') {
        table = '[professional_service_document]';
    } else if (vendorType == 'csVendor') {
        table = '[construction_service_document]';
    }
    var dbQuery = `SELECT Name FROM ${table} WHERE Id = '${Id}'`;
    var result = await db.query(dbQuery);
    logger.trace("[resourcedoc_model] :: getResourceDocumentById() : End");
    return result.recordset;
}