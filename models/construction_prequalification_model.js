const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const util = require('../util/basicutil')
const uuidv1 = require('uuid/v1');

exports.getCPVendors = async function (status, noCPs) {
    logger.debug("[CP_model] :: getCPVendors() : Start");
    var dbQuery = "SELECT TOP " + noCPs + " construction_prequalification.Id AS cpId , construction_vendor.Vendor AS vendor," +
        " construction_vendor.UserId AS userId, [user].TaxId, [construction_prequalification_vendor_checklist_status].Status FROM [construction_vendor]" +
        " LEFT JOIN construction_prequalification ON construction_prequalification.VendorId = construction_vendor.Id" +
        " LEFT JOIN construction_prequalification_status ON construction_prequalification_status.Id = construction_prequalification.StatusId" +
        " LEFT JOIN [user] ON [user].Id = construction_vendor.[UserId] " +
        " LEFT JOIN [construction_prequalification_vendor_checklist_status] ON [construction_prequalification_vendor_checklist_status].CPId = [construction_prequalification].Id" +
        " WHERE construction_prequalification_status.Status = '" + status + "' AND construction_vendor.Status = 1 ORDER BY vendor ASC"
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getCPVendors() : End");
    return result.recordset;
}

exports.updateCPstatus = async function (statusId, id, comment) {
    logger.debug("[CP_model] :: updateCPstatus() : Start" + comment);
    let newComment = ''
    if (comment != null) {
        newComment = util.replaceQuotes(comment)
    }
    var dbQuery = "UPDATE [dbo].[construction_prequalification]" +
        " SET [StatusId] = '" + statusId + "', " +
        " [Comment] = '" + newComment + "' " +
        " WHERE Id = '" + id + "'"
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: updateCPstatus() : End");
    return result.rowsAffected;
}

exports.getCPVendorsByStatus = async function (status) {
    logger.debug("[CP_model] :: getCPVendorsByStatus() : Start");
    var dbQuery = "SELECT Id FROM [construction_prequalification_status] WHERE Status= '" + status + "'"
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getCPVendorsByStatus() : End");
    return result.recordset;
}

exports.getCpDataByCategoryAndCPId = async function (params) {
    logger.debug("[CP_model] :: getCpDataByCategoryAndCPId() : Start");
    var dbQuery = `SELECT [construction_prequalification_doc].Id, Name, CPId, CPCatId, ResourceFileName 
                   FROM [construction_prequalification_doc] LEFT JOIN 
                   [construction_prequalification_doc_mapping] ON 
                   [construction_prequalification_doc].Id = [construction_prequalification_doc_mapping].CPDocId 
                   where CPId = '${params.cpId}' AND CPCatId='${params.catId}'`;
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getCpDataByCategoryAndCPId() : End");
    return result.recordset;
}

exports.updateCPDocument = async function (cpDocId, name, documentId, docMappingId, cpId, cpCatId, resourceFilename) {
    logger.debug("[CP_model] :: updateCPDocument() : Start");
    if (documentId !== 'null') {
        var dltQuery1 = `DELETE FROM [construction_prequalification_doc_mapping] WHERE CPDocId = '${documentId}'`;
        await db.query(dltQuery1);
        var dltQuery2 = `DELETE FROM [construction_prequalification_doc] WHERE Id = '${documentId}'`;
        await db.query(dltQuery2);
    }
    if (name.indexOf("'") > -1) {
        name = name.replace("'", "''");
    }
    var dbQuery1 = `INSERT INTO [construction_prequalification_doc] (Id, Name) 
                   VALUES ('${cpDocId}', '${name}')`;
    await db.query(dbQuery1);
    var dbQuery2 = `INSERT INTO [construction_prequalification_doc_mapping] (Id, CPId, CPDocId, CPCatId, ResourceFileName) 
                       VALUES ('${docMappingId}', '${cpId}', '${cpDocId}', '${cpCatId}', '${resourceFilename}')`;
    var result = db.query(dbQuery2);
    logger.debug("[CP_model] :: updateCPDocument() : End");
    return result.recordset;
}


exports.updateCPDocMapping = async function (Id, cpId, cpDocId, cpCatId, filename) {
    logger.debug("[CP_model] :: updateCPDocMapping() : Start");
    var dbQuery = `INSERT INTO [construction_prequalification_doc_mapping] (Id, CPId, CPDocId, CPCatId, ResourceFileName) 
                   VALUES ('${Id}', '${cpId}', '${cpDocId}', '${cpCatId}', '${filename}')`;
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: updateCPDocMapping() : End");
    return result.recordset;
}

exports.getCPDataByVendorId = async function (Id) {
    logger.debug("[CP_model] :: getCPdataByVendorId() : Start");
    var dbQuery = `SELECT [construction_prequalification].Id, Comment, IsEnvironmentCompleted, IsFinancialCompleted, IsHireHoustonCompleted, 
                   IsLitigationCompleted, IsOthersCompleted, IsSafetyCompleted, StatusId, VendorId, [construction_prequalification_status].Status from [construction_prequalification] 
                   LEFT JOIN [construction_prequalification_status] ON [construction_prequalification].StatusId = [construction_prequalification_status].Id
                   WHERE VendorId = '${Id}'`;
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getCPdataByVendorId() : End");
    return result.recordset;
}

exports.getCPDocAndCategory = async function () {
    logger.debug("[CP_model] :: getCPDocAndCategory() : Start");
    var dbQuery = `select [construction_prequalification_category].Id as CPCatId, 
                   Category, 
                   (SELECT  STRING_AGG(CONCAT([construction_service_document].Id, '+' ,[construction_service_document].Name) , ',') from [construction_service_document] JOIN 
                   [construction_service_document_mapping] ON [construction_service_document].Id = [construction_service_document_mapping].CSDId
                   Where [construction_service_document_mapping].CPCatId = [construction_prequalification_category].Id) as Name
                   from [construction_prequalification_category] `;
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getCPDocAndCategory() : End");
    return result.recordset;
}

exports.updateConstructionPrequalification = async function (completedSection, cpId, isSectionCompleted) {
    logger.debug("[CP_model] :: updateConstructionPrequalification() : Start");
    let query = ``;
    if (completedSection == 'financial') {
        query = `IsFinancialCompleted`
    } else if (completedSection == 'safety') {
        query = `IsSafetyCompleted`
    } else if (completedSection == 'litigation') {
        query = `IsLitigationCompleted`
    } else if (completedSection == 'environment') {
        query = `IsEnvironmentCompleted`
    } else if (completedSection == 'hireHouston') {
        query = `IsHireHoustonCompleted`
    } else if (completedSection == 'other') {
        query = `IsOthersCompleted`
    }
    var dbQuery = `UPDATE [construction_prequalification] SET ${query} = '${isSectionCompleted}' WHERE Id = '${cpId}'`;
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: updateConstructionPrequalification() : End");
    return result.recordset;
}

exports.setCPStatus = async function (cpId, status) {
    logger.debug("[CP_model] :: setCPStatus() : Start");
    var dbQuery = `UPDATE [construction_prequalification] SET StatusId = (
                   SELECT Id FROM [construction_prequalification_status] WHERE Status = '${status}'
                   ) WHERE Id = '${cpId}'`;
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: setCPStatus() : End");
    return result.recordset;
}

exports.getSearchResults = async function (params, noCPs, status) {
    logger.debug("[CP_model] :: getSearchResults() : Start");
    var dbQuery = "SELECT TOP " + noCPs + " construction_prequalification.Id AS cpId , construction_vendor.Vendor AS vendor," +
        " construction_vendor.UserId AS userId FROM [construction_vendor]" +
        " LEFT JOIN construction_prequalification ON construction_prequalification.VendorId = construction_vendor.Id" +
        " LEFT JOIN construction_prequalification_status ON construction_prequalification_status.Id = construction_prequalification.StatusId" +
        " WHERE construction_prequalification_status.Status = '" + status + "' AND construction_vendor.Status = 1" +
        " AND UPPER(construction_vendor.Vendor) LIKE '%" + params + "%' ORDER BY vendor ASC"
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getSearchResults() : End");
    return result.recordset;
}

exports.getCpDocByCPId = async function (cpId) {
    logger.debug("[CP_model] :: getCpDocByCPId() : Start");
    var dbQuery = "SELECT [construction_prequalification_doc].Id, [construction_prequalification_doc].Name, " +
        " [construction_prequalification_doc_mapping].CPId, [construction_prequalification_doc_mapping].CPCatId, " +
        " [construction_prequalification_doc_mapping].ResourceFileName , [construction_prequalification_category].Category " +
        " FROM [construction_prequalification_doc] " +
        " LEFT JOIN [construction_prequalification_doc_mapping] ON  [construction_prequalification_doc].Id = [construction_prequalification_doc_mapping].CPDocId  " +
        " JOIN [construction_prequalification_category] ON [construction_prequalification_category].Id = [construction_prequalification_doc_mapping].CPCatId  " +
        " WHERE CPId = '" + cpId + "'"
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getCpDocByCPId() : End");
    return result.recordset;
}

//This will insert new record to the [construction_prequalification] table
exports.addConstructionPrequalification = async function (cpId, vendorId) {
    logger.debug("[CP_model] :: addConstructionPrequalification() : Start");
    var dbQuery = "INSERT INTO [construction_prequalification]( [Id],[VendorId],[StatusId] ) " +
        "VALUES ('" + cpId + "','" + vendorId + "'," +
        " (SELECT Id FROM [construction_prequalification_status] WHERE status = 'Pending'))";
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: addConstructionPrequalification() : End");
    return result.recordset;
}

exports.getVendorIdByCPId = async function (cpId) {
    logger.debug("[CP_model] :: getVendorIdByCPId() : Start");
    var dbQuery = `SELECT VendorId FROM [construction_prequalification] 
                   WHERE Id = '${cpId}'`;
    var result = await db.query(dbQuery);
    logger.debug("[CP_model] :: getVendorIdByCPId() : End");
    return result.recordset;
}

// Save checklist
exports.saveCheckListData = async function (checklistData) {
    logger.debug("[CP_model] :: saveCheckListData() : Start");
    var dbQuery = `INSERT INTO [construction_prequalification_vendor_checklist] VALUES ${checklistData.join()}`;
    var result = await db.query(dbQuery);
    logger.trace("[CP_model] :: saveCheckListData() : End");
    return result.rowsAffected;
}

exports.deleteCheckListDataByCPIdAndIdentifier = async function (cpId, identifierList) {
    logger.debug("[CP_model] :: deleteCheckListDataByCPIdAndIdentifier() : Start");
    var dbQuery = `DELETE FROM [construction_prequalification_vendor_checklist] 
                   WHERE [CPId]='${cpId}' AND [Identifier] IN (${identifierList.join()})`;
    var result = await db.query(dbQuery);
    logger.trace("[CP_model] :: deleteCheckListDataByCPIdAndIdentifier() : End");
    return result.rowsAffected;
}

// Get checklist data by cp Id
exports.getCheckListByCPId = async function (cpId) {
    logger.debug("[CP_model] :: getCheckListByCPId() : Start");
    var dbQuery = `SELECT * FROM [construction_prequalification_vendor_checklist] WHERE [CPId]='${cpId}'`;
    var result = await db.query(dbQuery);
    logger.trace("[CP_model] :: getCheckListByCPId() : End");
    return result.recordset;
}

// Change CP checklist status
exports.changeCheckListStatus = async function (Id, cpId, status, userId, completedTime) {
    logger.debug("[CP_model] :: changeCheckListStatus() : Start");
    let dbQuery = "";
    if (status == "In Progress") {
        dbQuery = `IF NOT EXISTS (SELECT * FROM [construction_prequalification_vendor_checklist_status] 
                        WHERE [CPId] = '${cpId}')
                    BEGIN
                        INSERT INTO [construction_prequalification_vendor_checklist_status] (Id, CPId, Status, CompletedByUserId, CompleteTime)
                        VALUES('${Id}','${cpId}','${status}', '${userId}', '${completedTime}')
                    END`;
    } else if (status == "Completed") {
        dbQuery = `IF EXISTS (SELECT * FROM [construction_prequalification_vendor_checklist_status] WHERE [CPId] = '${cpId}')
                    BEGIN
                        UPDATE [construction_prequalification_vendor_checklist_status] SET [Status] = '${status}', 
                        [CompletedByUserId]='${userId}', [CompleteTime]='${completedTime}' WHERE [CPId] = '${cpId}'
                    END
                    ELSE
                    BEGIN
                        INSERT INTO [construction_prequalification_vendor_checklist_status] (Id, CPId, Status, CompletedByUserId, CompleteTime)
                        VALUES('${Id}','${cpId}','${status}', '${userId}', '${completedTime}')
                    END`;
    }
    const result = await db.query(dbQuery);
    logger.trace("[CP_model] :: changeCheckListStatus() : End");
    return result.rowsAffected;
}

// Adding data to history table
exports.addCheckListHistoryData = async function (cpId, statusId) {
    logger.debug("[CP_model] :: addCheckListHistoryData() : Start");
    const addDataQuery = `INSERT INTO [construction_prequalification_vendor_checklist_history] 
                  (Id, CPId, CPStatusLogId, Identifier, Value, UpdateByUserId, UpdateTime)
                  SELECT NEWID(), CPId, 
                  (SELECT Id FROM [construction_prequalification_status_log] WHERE CPId = '${cpId}'
                  AND [NewStatusId]='${statusId}'),
                  Identifier, Value, UpdateByUserId, UpdateTime
                  FROM [construction_prequalification_vendor_checklist] WHERE [CPId]='${cpId}'`;
    const addResult = await db.query(addDataQuery);
    if (addResult.rowsAffected[0] > 0) {
        const deleteCLQuery = `DELETE FROM [construction_prequalification_vendor_checklist] 
                   WHERE [CPId]='${cpId}'`;
        await db.query(deleteCLQuery);
        const deleteCLStatusQuery = `DELETE FROM [construction_prequalification_vendor_checklist_status] 
                   WHERE [CPId]='${cpId}'`;
        await db.query(deleteCLStatusQuery);
    }
    logger.trace("[CP_model] :: addCheckListHistoryData() : End");
    return addResult.rowsAffected;
}
