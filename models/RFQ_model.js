const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
var config = require('config')
const util = require('../util/basicutil')

let RFQS3URL = 'https://' + process.env.S3_BUCKETNAME + '.s3.amazonaws.com' + config.get('S3Config.BucketRFQ') + '/';
let LCS3URL = 'https://' + process.env.S3_BUCKETNAME + '.s3.amazonaws.com' + config.get('S3Config.BucketLC') + '/';

exports.getRFQData = async function (noOfRfqs) {
	logger.debug("[RFQ_model] :: getRFQData() : Start");
	var dbQuery = `SELECT TOP ${noOfRfqs} [RFQ].Id, [RFQ].Status as status, [RFQ].Title as title, [RFQ].SubmittalDate as submittalDate, [RFQ].Interview as interview,
                        [RFQ].PDFName as pdfName, [RFQ].Description as description,
                        CONCAT('` + RFQS3URL + `', [RFQ].Id, '.pdf') as downloadURL,
                        (SELECT  STRING_AGG (CONCAT([letter_of_clarification].Id,'+',[letter_of_clarification].Description) ,',') WITHIN GROUP (ORDER BY [letter_of_clarification].Description) FROM [letter_of_clarification] JOIN [RFQ_letter_of_clarification] ON [RFQ_letter_of_clarification].LClarificationId =  [letter_of_clarification].Id WHERE [RFQ_letter_of_clarification].RFQId = [RFQ].Id ) AS LCs,
                        (SELECT  STRING_AGG ([project_type].Type,', ') FROM [project_type] JOIN [RFQ_project_type] ON [RFQ_project_type].ProjectTypeId =  [project_type].Id WHERE [RFQ_project_type].RFQId = [RFQ].Id ) AS ProjectTypes
                        FROM [RFQ] 
                        WHERE [RFQ].Status = '1'
                        ORDER BY submittalDate DESC`;
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getRFQData() : End");
	return result.recordset;
}

exports.getLettersOfClarification = async function (rfqId) {
	logger.debug("[RFQ_model] :: getLettersOfClarification() : Start");
	var dbQuery = `SELECT [letter_of_clarification].Id as lcId, [letter_of_clarification].Description as description,
                   CONCAT('` + LCS3URL + `', [letter_of_clarification].Id, '.pdf') as downloadURL
                   FROM [letter_of_clarification] 
                   LEFT JOIN [RFQ_letter_of_clarification] ON [RFQ_letter_of_clarification].LClarificationId  = [letter_of_clarification].Id
                   WHERE [RFQ_letter_of_clarification].RFQId = '${rfqId}'`;
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getLettersOfClarification() : End");
	return result.recordset;
}

exports.insertRFQData = async function (id, PDFName, title, submittalDate, description, interview) {
	logger.debug("[RFQ_model] :: insertRFQData() : Start" + id, PDFName);
	var dbQuery = "INSERT INTO [RFQ] ( Id, Status, SubmittalDate, Title, Interview, PDFName, Description)" +
		" VALUES ('" + id + "', 1, '" + submittalDate + "', '" + util.replaceQuotes(title) + "', '" + interview + "', '" + util.replaceQuotes(PDFName) + "', '" + util.replaceQuotes(description) + "')";
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: insertRFQData() : End");
	return result.recordset;
}

exports.getRFQByTitle = async function (title) {
	logger.debug("[RFQ_model] :: getRFQByTitle() : Start");
	var dbQuery = "SELECT TOP(1) * FROM [RFQ] WHERE [RFQ].Title= '" + util.replaceQuotes(title) + "'"
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getRFQByTitle() : End");
	return result.recordset;
}

exports.getRFQProjectType = async function (rfqId) {
	logger.debug("[RFQ_model] :: getRFQProjectType() : Start");
	var dbQuery = `SELECT [project_type].Id as projectTypeId, [project_type].Type as type, [project_type].Status as status, [project_type].Number AS number 
                   FROM [project_type] LEFT JOIN [RFQ_project_type] ON [RFQ_project_type].ProjectTypeId = [project_type].Id
                   WHERE [RFQ_project_type].RFQId = '${rfqId}'`;
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getRFQProjectType() : End");
	return result.recordset;
}

exports.insertRFQProjectType = async function (id, rfqId, projectTypeId) {
	logger.debug("[RFQ_model] :: insertRFQProjectType() : Start");
	var dbQuery = "INSERT INTO [RFQ_project_type] (Id, RFQId, ProjectTypeId)" +
		" VALUES ('" + id + "', '" + rfqId + "', '" + projectTypeId + "')";
	var result = await db.query(dbQuery);
	logger.trace("RFQ_model] :: insertRFQProjectType() : End");
	return result.recordset;
}

exports.insertLetterOfClarification = async function (id, description) {
	logger.debug("[RFQ_model] :: insertLetterOfClarification() : Start");
	var dbQuery = "INSERT INTO [letter_of_clarification] (Id, Description)" +
		" VALUES ('" + id + "', '" + util.replaceQuotes(description) + "' )";
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: insertLetterOfClarification() : End");
	return result.recordset;
}

exports.insertRFQLC = async function (id, RFQId, LCId) {
	logger.debug("[RFQ_model] :: insertRFQLC() : Start");
	var dbQuery = "INSERT INTO [RFQ_letter_of_clarification] (Id, RFQId, LClarificationId)" +
		" VALUES ('" + id + "', '" + RFQId + "', '" + LCId + "' )";
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: insertRFQLC() : End");
	return result.recordset;
}

exports.getLCByName = async function (rfqId, title) {
	logger.debug("[RFQ_model] :: getLCByName() : Start");
	var dbQuery = "SELECT * FROM [letter_of_clarification] JOIN [RFQ_letter_of_clarification] ON" +
		" [letter_of_clarification].Id = [RFQ_letter_of_clarification].LClarificationId WHERE Description = '" + util.replaceQuotes(title) + "'" +
		"AND RFQ_letter_of_clarification.RFQId = '" + rfqId + "'";
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getLCByName() : End");
	return result.recordset;
}

exports.getLCByLCName = async function (name) {
	logger.debug("[RFQ_model] :: getLCByLCName() : Start");
	var dbQuery = `SELECT * FROM [letter_of_clarification] WHERE [Description] = '${util.replaceQuotes(name)}'`
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getLCByLCName() : End");
	return result.recordset;
}

exports.deleteRFQLCProjectType = async function (rfqId) {
	logger.debug("[RFQ_model] :: deleteRFQLCProjectType() : Start");
	var dbQuery1 = "DELETE FROM [RFQ_letter_of_clarification] WHERE RFQId= '" + rfqId + "'"
	var result1 = await db.query(dbQuery1);
	var dbQuery2 = "DELETE FROM [RFQ_project_type] WHERE RFQId= '" + rfqId + "'"
	var result2 = await db.query(dbQuery2);
	var dbQuery3 = "DELETE FROM [RFQ] WHERE Id= '" + rfqId + "'"
	var result3 = await db.query(dbQuery3);
	logger.trace("[RFQ_model] :: deleteRFQLCProjectType() : End");
	return true;
}

exports.deleteRFQLC = async function (lcId) {
	logger.debug("[RFQ_model] :: deleteRFQLC() : Start");
	var dbQuery = "DELETE FROM [RFQ_letter_of_clarification] WHERE LClarificationId= '" + lcId + "'"
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: ddeleteRFQLC() : End");
	return true;
}

exports.getSearchResults = async function (params, noOfRfqs) {
	logger.debug("[RFQ_model] :: getSearchResults() : Start");
	let singleQuoteRegex = /'/g;
	let query = ``;
	let query1 = ``;
	if (params.type === 'title') {
		if (params.value.indexOf('[') > -1) {
			query = `[RFQ].Status = '1' AND (
					 UPPER([RFQ].Title) LIKE '%${util.replaceQuotes(this.insertAt(params.value)).toUpperCase()}%' ESCAPE '\\' OR 
					 UPPER([RFQ].Description) LIKE '%${util.replaceQuotes(this.insertAt(params.value)).toUpperCase()}%' ESCAPE '\\' OR
					 UPPER(CONCAT([RFQ].Title, ' ', [RFQ].Description)) LIKE '%${util.replaceQuotes(this.insertAt(params.value)).toUpperCase()}%' ESCAPE '\\'
					 )`;
		} else {
			query = `[RFQ].Status = '1' AND (
					UPPER([RFQ].Title) LIKE '%${util.replaceQuotes(params.value).toUpperCase()}%' OR 
					UPPER([RFQ].Description) LIKE '%${util.replaceQuotes(params.value).toUpperCase()}%' OR
					UPPER(CONCAT([RFQ].Title, ' ', [RFQ].Description)) LIKE '%${util.replaceQuotes(params.value).toUpperCase()}%'
					)`;
		}
	} else if (params.type === 'date') {
		query = `[RFQ].Status = '1' AND [RFQ].SubmittalDate >='${params.value}'`;
	} else if (params.type === 'status') {
		query = (params.value === 'active') ? `[RFQ].Status = '1'` : `[RFQ].Status = '0'`;
	} else if (params.type === 'projectType') {
		query = `[RFQ].Status = '1'`;
		if (params.value.indexOf('[') > -1) {
			query1 = `WHERE ProjectTypes LIKE '%${this.insertAt(params.value)}%' ESCAPE '\\'`;
		} else {
			query1 = `WHERE ProjectTypes LIKE '%${params.value}%'`;
		}
	}
	var dbQuery = `SELECT TOP(${noOfRfqs}) T.* FROM (
                        SELECT  [RFQ].Id,[RFQ].Status as status, [RFQ].Title as title, [RFQ].SubmittalDate as submittalDate, [RFQ].Interview as interview,
                        [RFQ].PDFName as pdfName, [RFQ].Description as description,
                        CONCAT('` + RFQS3URL + `', [RFQ].Id, '.pdf') as downloadURL,
                        (SELECT  STRING_AGG (CONCAT([letter_of_clarification].Id,'+',[letter_of_clarification].Description) ,',') WITHIN GROUP (ORDER BY [letter_of_clarification].Description) FROM [letter_of_clarification] JOIN [RFQ_letter_of_clarification] ON [RFQ_letter_of_clarification].LClarificationId =  [letter_of_clarification].Id WHERE [RFQ_letter_of_clarification].RFQId = [RFQ].Id ) AS LCs,
                        (SELECT  STRING_AGG ([project_type].Type,',') FROM [project_type] JOIN [RFQ_project_type] ON [RFQ_project_type].ProjectTypeId =  [project_type].Id WHERE [RFQ_project_type].RFQId = [RFQ].Id ) AS ProjectTypes
                        FROM [RFQ] 
                        WHERE ${query}
                        ) T ${query1}
						ORDER BY submittalDate DESC`;
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getSearchResults() : End");
	return result.recordset;
}

exports.insertAt = function (str) {
	let position = str.indexOf('[');
	let output = str.substring(0, position) + `\\` + str.substring(position);
	return output;
}

exports.getRFQByLCId = async function (lcId) {
	logger.debug("[RFQ_model] :: getRFQByLCId() : Start");
	var dbQuery = "SELECT [RFQ].PDFName AS name FROM [RFQ]" +
		" LEFT JOIN [RFQ_letter_of_clarification] ON [RFQ_letter_of_clarification].RFQId = [RFQ].Id" +
		" WHERE [RFQ_letter_of_clarification].LClarificationId = '" + lcId + "'"
	console.log(dbQuery)
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getRFQByLCId() : End");
	return result;
}

// Get SOQ status for all the RFQs for a given vendor
exports.getSOQStatus = async function (vendorId) {
	logger.debug("[RFQ_model] :: getSOQStatus() : Start");
	var dbQuery = "SELECT [RFQ].Id, [SOQ].Status FROM [RFQ]" +
		" LEFT JOIN [SOQ] ON [RFQ].Id = [SOQ].RFQId WHERE [SOQ].VendorId = '" + vendorId + "'"
	console.log(dbQuery)
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getSOQStatus() : End");
	return result.recordset;
}

// Get RFQ details by the RFQ Id
exports.getRFQDetailsByRFQId = async function (rfqId) {
	logger.debug("[RFQ_model] :: getRFQDetailsByRFQId() : Start");
	var dbQuery = `SELECT Title, Description, SubmittalDate FROM [RFQ] WHERE Id = '${rfqId}'`
	console.log(dbQuery)
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getRFQDetailsByRFQId() : End");
	return result.recordset;
}

// Get matching HPW100s for RFQ project types
exports.getMatchingHPW100sByRFQ = async function (rfqId, vendorId) {
	logger.debug("[SOQ_model] :: getMappingHPW100sByRFQ() : Start");
	var dbQuery = `SELECT * FROM [RFQ_project_type]
    JOIN [HPW100] ON [RFQ_project_type].ProjectTypeId = [HPW100].ProjectTypeId
    WHERE [RFQ_project_type].RFQId = '${rfqId}' AND [HPW100].VendorId = '${vendorId}'`;
	console.log(dbQuery)
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getMappingHPW100sByRFQ() : End");
	return result.recordset;
}

// Get RFQ project types
exports.getRFQProjectTypes = async function (rfqId) {
	logger.debug("[SOQ_model] :: getRFQProjectTypes() : Start");
	var dbQuery = `SELECT * FROM [RFQ_project_type]
    WHERE [RFQ_project_type].RFQId = '${rfqId}'`;
	console.log(dbQuery)
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getRFQProjectTypes() : End");
	return result.recordset;
}

// Get all the RFQ details by the RFQ Id
exports.getAllRFQDetailsByRFQId = async function (rfqId) {
	logger.debug("[RFQ_model] :: getAllRFQDetailsByRFQId() : Start");
	var dbQuery = "SELECT Title, Description, SubmittalDate, " +
		"(SELECT  STRING_AGG ([project_type].Type,', ') FROM [project_type] JOIN [RFQ_project_type] ON [RFQ_project_type].ProjectTypeId =  [project_type].Id WHERE [RFQ_project_type].RFQId = '" + rfqId + "' ) AS ProjectTypes " +
		" FROM [RFQ] WHERE Id = '" + rfqId + "'"
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getAllRFQDetailsByRFQId() : End");
	return result.recordset;
}


// Get No of active RFQ
exports.getNoOfActiveRFQs = async function () {
	logger.debug("[RFQ_model] :: getNoOfActiveRFQs() : Start");
	var dbQuery = `SELECT COUNT(Id) AS count FROM [RFQ] WHERE Status = '1'`
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getNoOfActiveRFQs() : End");
	return result.recordset;
}

// Update RFQ data
exports.updateRFQByRFQId = async function (rfqId, description, submittalDate, interview) {
	logger.debug("[RFQ_model] :: updateSubmittalDateByRFQId() : Start");
	var dbQuery = `UPDATE [RFQ] SET `
	if (description !== undefined) {
		dbQuery += `Description = '${util.replaceQuotes(description)}', `
	}
	if (submittalDate !== undefined) {
		dbQuery += `SubmittalDate = '${submittalDate}', `
	}
	if (interview !== undefined) {
		dbQuery += `Interview = '${interview}' `
	}
	dbQuery += `WHERE Id = '${rfqId}'`;
	dbQuery = dbQuery.replace(', WHERE', ' WHERE')
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: updateSubmittalDateByRFQId() : End");
	return result.rowsAffected;
}

// Get RFQs associated with same LC given
exports.getRFQsForExistingLC = async function (lc) {
	logger.debug("[RFQ_model] :: getRFQsForExistingLC() : Start");
	var dbQuery = `SELECT [RFQ].Id, [RFQ].Title FROM [RFQ] WHERE Id IN 
					(SELECT [RFQId] FROM [RFQ_letter_of_clarification] WHERE [LClarificationId] IN 
					(SELECT Id FROM [letter_of_clarification] WHERE [Description] = '${lc}'))`
	var result = await db.query(dbQuery);
	logger.trace("[RFQ_model] :: getRFQsForExistingLC() : End");
	return result.recordset;
}