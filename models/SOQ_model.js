const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const util = require('../util/basicutil')

exports.getSOQByRFQId = async function (rfqId) {
	logger.debug("[SOQ_model] :: getSOQByRFQId() : Start");
	var dbQuery = `SELECT [SOQ].Id, VendorId, SubmittalDate, DeadlineDate, Status, 
                   Question1, Question2, Question3, Question4, Question5, Question6, RFQId, [professional_service_vendor].Vendor 
                   FROM [SOQ] JOIN [professional_service_vendor] ON [SOQ].VendorId = [professional_service_vendor].Id  
                   WHERE RFQId = '${rfqId}' AND Status = 'Submitted' ORDER BY [professional_service_vendor].Vendor `
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getSOQByRFQId() : End");
	return result.recordset;
}

//This will return the soq record for a given RFQ and vendor
exports.getSOQByRFQAndVendor = async function (rfqId, vendorId) {
	logger.debug("[SOQ_model] :: getSOQByRFQId() : Start");
	var dbQuery = `SELECT [SOQ].Id, VendorId, SubmittalDate, DeadlineDate, Status, 
    convert(varchar(max), Question1, 0) AS Question1, convert(varchar(max), Question2, 0) AS Question2, convert(varchar(max), Question3, 0) AS Question3, 
    convert(varchar(max), Question4, 0) AS Question4, convert(varchar(max), Question5, 0) AS Question5, convert(varchar(max), Question6, 0) AS Question6,
    RFQId, PDFName, [professional_service_vendor].Vendor 
    FROM [SOQ] JOIN [professional_service_vendor] ON [SOQ].VendorId = [professional_service_vendor].Id  
    WHERE RFQId = '${rfqId}' AND VendorId = '${vendorId}'`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getSOQByRFQId() : End");
	return result.recordset;
}

//This will insert new record into the SOQ table
exports.addSOQ = async function (soqId, soq) {
	logger.debug("[SOQ_model] :: addSOQ() : Start");
	var dbQuery = "INSERT INTO [dbo].[SOQ](Id, VendorId, SubmittalDate, DeadlineDate, Status, Question1," +
		"Question2, Question3, Question4, Question5, Question6, RFQId) OUTPUT INSERTED.Id VALUES ('" + soqId + "', '" + soq.vendorId + "', GETDATE()," +
		"(SELECT [RFQ].SubmittalDate FROM [RFQ] WHERE Id = '" + soq.rfqId + "'), '" + soq.status + "', convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question1)) + "'), convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question2)) +
		"'), convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question3)) + "'), convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question4)) + "'), convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question5)) + "'), convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question6)) + "'), '" + soq.rfqId + "')";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: addSOQ() : End");
	return result.recordset;
}

//This will update the existing record in SOQ table
exports.updateSOQ = async function (soqId, soq) {
	logger.debug("[SOQ_model] :: updateSOQ() : Start");
	var dbQuery = "UPDATE [SOQ] SET SubmittalDate = GETDATE(), Status = '" + soq.status + "', Question1 =  convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question1)) + "'), Question2 =  convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question2)) +
		"'), Question3 =  convert(varbinary(max),'" + util.encodeHTML(util.replaceQuotes(soq.question3)) + "'), Question4 =  convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question4)) + "'), Question5 =  convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question5)) + "'), Question6 =  convert(varbinary(max), '" + util.encodeHTML(util.replaceQuotes(soq.question6)) +
		"') FROM [SOQ] WHERE Id = '" + soqId + "'";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: updateSOQ() : End");
	return result.recordset;
}

//This will delete the SOQ from the database
exports.deleteSOQ = async function (soqId) {
	logger.debug("[SOQ_model] :: deleteSOQ() : Start");
	var dbQuery1 = `DELETE FROM [HPW100_SOQ] WHERE SOQId = '${soqId}'`;
	var result1 = await db.query(dbQuery1);
	var dbQuery2 = `DELETE FROM [SOQ_subvendor] WHERE SOQId = '${soqId}'`;
	var result2 = await db.query(dbQuery2);
	var dbQuery3 = `DELETE FROM [SOQ] WHERE Id = '${soqId}'`;
	var result3 = await db.query(dbQuery3);
	var dbQuery4 = `DELETE FROM [SOQ_generated_pdf] WHERE SOQId = '${soqId}'`;
	var result4 = await db.query(dbQuery4);
	logger.debug("[SOQ_model] :: deleteSOQ() : End");
}

//This will return the HPW100s
exports.getHPW100sByVendorId = async function (vendorId) {
	logger.debug("[SOQ_model] :: getHPW100sByVendorId() : Start");
	var dbQuery = `SELECT [HPW100].Id, [project_type].Type, [project_type].Id AS ProjectTypeId
    FROM [HPW100] 
    JOIN [project_type] ON [HPW100].ProjectTypeId = [project_type].Id
    WHERE [HPW100].VendorId = '${vendorId}' ORDER BY [project_type].Type`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getHPW100sByVendorId() : End");
	return result.recordset;
}

//This will return the professional service sub vendors
exports.getPSSubVendors = async function (vendorId) {
	logger.debug("[SOQ_model] :: getPSSubVendors() : Start");
	var dbQuery = `SELECT Id, UserId, Vendor FROM [professional_service_vendor]
    WHERE Id != '${vendorId}' ORDER BY Vendor`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getPSSubVendors() : End");
	return result.recordset;
}

//This will insert new record into the HPW100_SOQ table
exports.addHPW100SOQ = async function (id, hpw100Id, soqId) {
	logger.debug("[SOQ_model] :: addHPW100SOQ() : Start");
	var dbQuery = "INSERT INTO [dbo].[HPW100_SOQ] ([Id], [HPW100Id], [SOQId]) VALUES ('" +
		id + "', '" + hpw100Id + "', '" + soqId + "')";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: addHPW100SOQ() : End");
	return result.recordset;
}

//This will return the primary key of the HPW100_SOQ table
exports.getHPW100SOQ = async function (hpw100Id, soqId) {
	logger.debug("[SOQ_model] :: getHPW100SOQ() : Start");
	var dbQuery = `SELECT Id FROM [HPW100_SOQ] WHERE HPW100Id = '${hpw100Id}' 
    AND SOQId = '${soqId}'`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getHPW100SOQ() : End");
	return result.recordset;
}

//This will return all the HPW100s for a given SOQId from the HPW100_SOQ table
exports.getSOQHPW100sBySOQId = async function (soqId) {
	logger.debug("[SOQ_model] :: getSOQHPW100sBySOQId() : Start");
	var dbQuery = `SELECT [HPW100].Id, [project_type].Type, [project_type].Id AS ProjectTypeId
    FROM [HPW100_SOQ]
    JOIN [HPW100] ON [HPW100_SOQ].HPW100Id = [HPW100].Id
    JOIN [project_type] ON [HPW100].ProjectTypeId = [project_type].Id
    WHERE [HPW100_SOQ].SOQId = '${soqId}' ORDER BY [project_type].Type`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getSOQHPW100sBySOQId() : End");
	return result.recordset;
}

//This will delete all the records from the HPW100_SOQ table for a given SOQ Id
exports.deleteHPW100SOQ = async function (soqId) {
	logger.debug("[SOQ_model] :: deleteHPW100SOQ() : Start");
	var dbQuery = `DELETE FROM [HPW100_SOQ] WHERE SOQId = '${soqId}'`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: deleteHPW100SOQ() : End");
	return result.recordset;
}

//This will return the primary key of the SOQ_subvendor table
exports.getSOQSubVendor = async function (subVendorUserId, soqId) {
	logger.debug("[SOQ_model] :: getSOQSubVendor() : Start");
	var dbQuery = `SELECT Id FROM [SOQ_subvendor] WHERE SubvendorId = '${subVendorUserId}' 
    AND SOQId = '${soqId}'`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getSOQSubVendor() : End");
	return result.recordset;
}

//This will return all the sub vendors for a given SOQId from SOQ_subvendor table
exports.getSOQSubVendorsBySOQId = async function (soqId) {
	logger.debug("[SOQ_model] :: getSOQSubVendorsBySOQId() : Start");
	var dbQuery = `SELECT [professional_service_vendor].UserId, [professional_service_vendor].Vendor 
    FROM [SOQ_subvendor] 
    JOIN [professional_service_vendor] ON [SOQ_subvendor].SubvendorId = [professional_service_vendor].UserId
    WHERE [SOQ_subvendor].SOQId = '${soqId}' ORDER BY [professional_service_vendor].Vendor`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getSOQSubVendorsBySOQId() : End");
	return result.recordset;
}

//This will delete all the records from the SOQ_subvendor table for a given SOQ Id
exports.deleteSOQSubVendor = async function (soqId) {
	logger.debug("[SOQ_model] :: deleteSOQSubVendor() : Start");
	var dbQuery = `DELETE FROM [SOQ_subvendor] WHERE SOQId = '${soqId}'`
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: deleteSOQSubVendor() : End");
	return result.recordset;
}

//This will insert new record into the SOQ_subvendor table
exports.addSOQSubvendor = async function (id, soqId, subvendorId) {
	logger.debug("[SOQ_model] :: addSOQSubvendor() : Start");
	var dbQuery = "INSERT INTO [dbo].[SOQ_subvendor] ([Id], [SOQId], [SubvendorId]) VALUES ('" +
		id + "', '" + soqId + "', '" + subvendorId + "')";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: addSOQSubvendor() : End");
	return result.recordset;
}


// Set PDFName of the SOQ table
exports.updateSOQFileName = async function (soqId, fileName) {
	logger.debug("[SOQ_model] :: updateSOQFileName() : Start");
	if (fileName.indexOf("'") > -1) {
		fileName = fileName.replace("'", "''");
	}
	var dbQuery = "UPDATE [SOQ] SET [SOQ].PDFName = '" + fileName + "' WHERE Id = '" + soqId + "'";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: updateSOQFileName() : End");
	return result.recordset;
}

//This will insert new record into theSOQ_generated_pdf table
exports.addSOQGeneratedPDF = async function (id, soqId) {
	logger.debug("[SOQ_model] :: addSOQGeneratedPDF() : Start");
	var dbQuery = "INSERT INTO [dbo].[SOQ_generated_pdf] ([Id], [SOQId]) VALUES ('" + id + "', '" + soqId + "')";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: addSOQGeneratedPDF() : End");
	return result.recordset;
}

// Update SOQ status
exports.updateSOQStatus = async function (soqId, status) {
	logger.debug("[SOQ_model] :: updateSOQStatus() : Start");
	var dbQuery = "UPDATE [SOQ] SET [SOQ].Status = '" + status + "' WHERE Id = '" + soqId + "'";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: updateSOQStatus() : End");
	return result.recordset;
}

// Get generated SOQ document Id by SOQ Id
exports.getGeneratedSOQDocIdBySOQId = async function (soqId) {
	logger.debug("[SOQ_model] :: getGeneratedSOQDocIdBySOQId() : Start");
	var dbQuery = `SELECT Id FROM [SOQ_generated_pdf] WHERE SOQId = '${soqId}'`;
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getGeneratedSOQDocIdBySOQId() : End");
	return result.recordset;
}

// Getting submission data for a given vendor and soq
exports.getSubmissionData = async function (vendorId, soqId) {
	logger.debug("[SOQ_model] :: downloadAll() : Start");
	var dbQuery = `SELECT PDFName, [SOQ_generated_pdf].Id as generatedPdfId, [SOQ].Id AS soqId, [SOQ].VendorId, [professional_service_vendor].Vendor AS vendorName, 
				   [professional_service_vendor].Id AS GUID,
				   (SELECT STRING_AGG(CONCAT([HPW100_SOQ].HPW100Id, '+', [project_type].Type), ',') FROM [HPW100_SOQ] 
				   JOIN [SOQ] ON [HPW100_SOQ].SOQId = [SOQ].Id 
				   JOIN [HPW100] ON [HPW100].Id = [HPW100_SOQ].HPW100Id
				   JOIN [project_type] ON [project_type].Id = [HPW100].ProjectTypeId
				   WHERE [SOQ].Id = '${soqId}') AS hpw100Info
				   FROM [SOQ] 
				   LEFT JOIN [SOQ_generated_pdf] ON [SOQ].Id = [SOQ_generated_pdf].SOQId
				   LEFT JOIN [professional_service_vendor] ON [SOQ].VendorId = [professional_service_vendor].Id
				   WHERE VendorId = '${vendorId}' AND [SOQ].Id = '${soqId}'`;
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: downloadAll() : End");
	return result.recordset;
}

exports.deleteGeneratedSOQ = async function (generatedDocId) {
	logger.debug("[SOQ_model] :: deleteGeneratedSOQ() : Start");
	var dbQuery = `DELETE FROM [SOQ_generated_pdf] WHERE Id = '${generatedDocId}'`;
	await db.query(dbQuery);
	logger.debug("[SOQ_model] :: deleteGeneratedSOQ() : End");
}

// Determine if RFQ zip is ready to download or not
exports.getZippedRFQByRFQId = async function (rfqId) {
	logger.debug("[SOQ_model] :: getZippedRFQByRFQId() : Start");
	var dbQuery = `SELECT Id FROM [RFQ_SOQ_zip_info] WHERE [RFQId] = '${rfqId}' AND [IsCompleted] = '1'`;
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getZippedRFQByRFQId() : End");
	return result.recordset;
}
