const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const uuidv1 = require('uuid/v1');
var bcrypt = require('bcryptjs');
var config = require('config')
const util = require('../util/basicutil')


// Update profile data of professional vendor.
exports.updateProfileInfoByVendorId = async function (professionalVendor) {
	logger.debug("[professional_vendor_model] :: updateProfileInfoByVendorId() : Start");
	// Update professional_service_vendor table.
	let query = "";
	if (professionalVendor.yearEstablished === null) {
		query = "[YearEstablished]= " + professionalVendor.yearEstablished + " , "
	} else {
		query = "[YearEstablished]= '" + professionalVendor.yearEstablished + "' , "
	}
	var dbQuery = "UPDATE [professional_service_vendor] SET " +
		//"[ActMgrName]= '" + util.replaceQuotes(professionalVendor.actMgrName) + "' , " +
		//"[ActMgrPhone]= '" + professionalVendor.actMgrPhone + "' , " +
		//"[ActMgrEmail]= '" + professionalVendor.actMgrEmail + "' , " +
		// "[FirmName]= '" + professionalVendor.firmName + "' , " +
		"[Vendor]= '" + (professionalVendor.companyName == null ? "" : util.replaceQuotes(professionalVendor.companyName)) + "' , " +
		"[VendorNo]= '" + (professionalVendor.vendorNo == null ? "" : util.replaceQuotes(professionalVendor.vendorNo)) + "' , " +
		"[DBA]= '" + (professionalVendor.dba == null ? "" : util.replaceQuotes(professionalVendor.dba)) + "' , " +
		"[BusinessAddress]= '" + (professionalVendor.businessADD == null ? "" : util.replaceQuotes(professionalVendor.businessADD)) + "' , " + query +
		//"[YearEstablished]= '" + professionalVendor.yearEstablished + "' , " +
		"[BusinessAddrCity]= '" + (professionalVendor.businessCity == null ? "" : util.replaceQuotes(professionalVendor.businessCity)) + "' , " +
		"[BusinessAddrState]= '" + ((professionalVendor.businessState == "" || professionalVendor.businessState == null) ? "" : professionalVendor.businessState.value) + "' , " +
		"[BusinessAddrZipcode]= '" + (professionalVendor.businessZip == null ? "" : util.replaceQuotes(professionalVendor.businessZip)) + "' , " +
		"[Mailing]= '" + (professionalVendor.mailing == null ? "" : util.replaceQuotes(professionalVendor.mailing)) + "' , " +
		"[MailingAddress]= '" + (professionalVendor.mailing == null ? "" : util.replaceQuotes(professionalVendor.mailing)) + "' , " +
		"[IsMailingAddrSame]= " + professionalVendor.isMailingAddrSame + " , " +
		"[MailingAddrCity]= '" + (professionalVendor.mailingCity == null ? "" : util.replaceQuotes(professionalVendor.mailingCity)) + "' , " +
		"[MailingAddrState]= '" + ((professionalVendor.mailingState == "" || professionalVendor.mailingState == null) ? "" : professionalVendor.mailingState.value) + "' , " +
		"[MailingAddrZipcode]= '" + (professionalVendor.mailingZip == null ? "" : util.replaceQuotes(professionalVendor.mailingZip)) + "' , " +
		"[Website]= '" + (professionalVendor.website == null ? "" : professionalVendor.website) + "' , " +
		"[Phone]= '" + (professionalVendor.companyPhone == null ? "" : professionalVendor.companyPhone) + "' , " +
		"[HoustonOffice]= '" + (professionalVendor.houstonOffice == null ? "" : professionalVendor.houstonOffice) + "' , " +
		"[ParentCompany]= '" + (professionalVendor.parentCompany ? (professionalVendor.parentCompany == null ? "" : util.replaceQuotes(professionalVendor.parentCompany)) : '') + "' , " +
		"[CertificateNo]= '" + (professionalVendor.certificateNo ? (professionalVendor.certificateNo == null ? "" : util.replaceQuotes(professionalVendor.certificateNo)) : '') + "' , " +
		"[TotalPersonnel]= " + professionalVendor.totalPersonnel + " , " +
		"[FirmTotalPersonnel]= " + professionalVendor.firmTotalPersonnel + " , " +
		"[TxBoardOfProf]= '" + (professionalVendor.txBoardOfProf == null ? "" : util.replaceQuotes(professionalVendor.txBoardOfProf)) + "'," +
		"[IsCertified]= " + professionalVendor.isCertified + ", " +
		"[IsProfileInfoCompleted]= '" + professionalVendor.isFormCompleted + "', " +
		"[IsHoustonOfcPresent] = " + professionalVendor.hasHoustonOffice + "," +
		"[IsHoustonOfcParentComp] = " + professionalVendor.isHoustonOfficeParent +
		" WHERE Id= '" + professionalVendor.id + "'";
	var result = await db.query(dbQuery);
	// Update user table.
	//var company = professionalVendor.vendor.replace("'", "''")
	var dbQueryUser = "UPDATE [user] SET " +
		"TaxId= '" + professionalVendor.taxId + "', " +
		"Company= '" + (professionalVendor.companyName == null ? "" : util.replaceQuotes(professionalVendor.companyName)) + "', " +
		"Phone= '" + (professionalVendor.companyPhone == null ? "" : professionalVendor.companyPhone) + "' " +
		"WHERE Id= '" + professionalVendor.userId + "'";
	var result = await db.query(dbQueryUser);
	logger.trace("[professional_vendor_model] :: updateProfileInfoByVendorId() : End");
	return result.recordset;
}

// Update principal contact information by id.
exports.updatePrincipalContactInfoByVendorId = async function (professionalVendor) {
	logger.debug("[professional_vendor_model] :: updatePrincipalContactInfoByVendorId() : Start");
	var dbQuery = "UPDATE [professional_service_vendor] SET " +
		"PrincipalName= '" + (professionalVendor.principalName == null ? '' : util.replaceQuotes(professionalVendor.principalName)) + "' , " +
		"PrincipalTitle= '" + (professionalVendor.principalTitle == null ? '' : util.replaceQuotes(professionalVendor.principalTitle)) + "' , " +
		"PrincipalEmail= '" + (professionalVendor.principalEmail == null ? '' : professionalVendor.principalEmail) + "' , " +
		"PrincipalPhone= '" + (professionalVendor.principalPhone == null ? '' : professionalVendor.principalPhone) + "' , " +
		"IsPrincipalContInfoCompleted= '" + professionalVendor.isFormCompleted + "'" +
		" WHERE Id= '" + professionalVendor.id + "'";
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: updatePrincipalContactInfoByVendorId() : End");
	return result.recordset;
}

// Update Acc. manager Info by id.
exports.updateAccManagerInfoByVendorId = async function (professionalVendor) {
	logger.debug("[professional_vendor_model] :: updateAccManagerInfoByVendorId() : Start");
	var dbQuery = `UPDATE [professional_service_vendor] SET
				   ActMgrName = '${professionalVendor.actMgrName === null ? "" : util.replaceQuotes(professionalVendor.actMgrName)}',
				   ActMgrPhone = '${professionalVendor.actMgrPhone === null ? "" : professionalVendor.actMgrPhone}',
				   ActMgrEmail = '${professionalVendor.actMgrEmail === null ? "" : professionalVendor.actMgrEmail}',
				   IsAccManagerInfoCompleted = '${professionalVendor.isFormCompleted}' 
				   WHERE Id = '${professionalVendor.id}'`;
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: updateAccManagerInfoByVendorId() : End");
	return result.recordset;
}

// Insert vendor fees in to vendor_service_fee table.
exports.addProfessionalServiceFeeByVendorId = async function (professionalVendor) {
	logger.debug("[professional_vendor_model] :: addProfessionalServiceFeeByVendorId() : Start");
	// Delete existing vendor fees before inserting new records.
	var deleteVendorFeeQuery = "DELETE FROM vendor_service_fee WHERE VendorId = '" +
		professionalVendor.id + "';";
	var deletevendorFeeList = await db.query(deleteVendorFeeQuery);
	// Create vendor fee values string for insert query.
	let feesList = "";
	for (var i = 0; i < professionalVendor.vendorfees.length; i++) {
		var Id = uuidv1()
		if (feesList != "") {
			feesList += ",";
		}
		var houstonOfficeFees = professionalVendor.vendorfees[i].houstonOfficeFees.replace('$', "")
		var firmTotalFees = professionalVendor.vendorfees[i].firmTotalFees.replace('$', "")
		feesList += "('" + Id +
			"', '" + professionalVendor.id +
			"', " + professionalVendor.vendorfees[i].year +
			", '" + professionalVendor.vendorfees[i].contractWork +
			"', '" + houstonOfficeFees +
			"', '" + firmTotalFees +
			"')";
	}
	// Bulk insert query
	var dbQuery = "INSERT INTO [dbo].[vendor_service_fee] ([Id], [VendorId], [Year], [ContractWork], [TotalFee], [FirmTotalFee])" +
		"VALUES " + feesList + ";";
	var result = await db.query(dbQuery);
	var dbQuerySectionCompleted = "UPDATE [professional_service_vendor] SET " +
		"IsVendorFeesCompleted = '" + professionalVendor.isFormCompleted + "'" +
		" WHERE Id= '" + professionalVendor.id + "'";
	var result = await db.query(dbQuerySectionCompleted);
	logger.trace("[professional_vendor_model] :: addProfessionalServiceFeeByVendorId() : End");
	return result.recordset;
}

// Update additional full time data in professional_service_vendor table and insert vendor offices.
exports.updateAdditionalFulltimePersonnelByVendorId = async function (professionalVendor) {
	logger.debug("[professional_vendor_model] :: updateAdditionalFulltimePersonnelByVendorId() : Start");
	// Update additional full time data.
	// Delete existing vendor offices.
	var deleteVendorOfficeQuery = "DELETE FROM vendor_office WHERE VendorId = '" + professionalVendor.id + "';";
	var deletevendorOfficeList = await db.query(deleteVendorOfficeQuery);
	// Insert new vendor offices.
	let officeList = "";
	for (var i = 0; i < professionalVendor.vendorOffices.length; i++) {
		//add only non empty
		/*if (professionalVendor.vendorOffices[i].city &&
			professionalVendor.vendorOffices[i].state &&
			professionalVendor.vendorOffices[i].personnelByOffice &&
			professionalVendor.vendorOffices[i].phone) {*/

		var Id = uuidv1()
		if (officeList != "") {
			officeList += ",";
		}
		officeList += "('" + Id +
			"', '" + professionalVendor.id +
			"', '" + util.replaceQuotes(professionalVendor.vendorOffices[i].city) +
			"', '" + professionalVendor.vendorOffices[i].state +
			"', '" + professionalVendor.vendorOffices[i].personnelByOffice +
			"', '" + professionalVendor.vendorOffices[i].phone +
			"')";

		//	}
	}
	if (officeList != "") {
		var dbQuery = "INSERT INTO [dbo].[vendor_office] ( [Id], [VendorId], [City], [State], [OfficePersonnel], [Phone])" +
			" VALUES " + officeList + ";";
		var result = await db.query(dbQuery);
		await db.query(`UPDATE [professional_service_vendor] SET IsPresentOfficesCompleted = '${professionalVendor.isFormCompleted}' WHERE Id = '${professionalVendor.id}'`);
	}
	logger.trace("[professional_vendor_model] :: updateAdditionalFulltimePersonnelByVendorId() : End");
	return result.recordset;
}

// Insert full time personnel in to vendor_full_time_personnel tables.
exports.addFulltimePersonnelByVendorId = async function (professionalVendor) {
	logger.debug("[professional_vendor_model] :: addFulltimePersonnelByVendorId() : Start");
	let vendorfullTimeList = "";

	for (var i = 0; i < professionalVendor.fullTimePersonnel.length; i++) {
		if (professionalVendor.fullTimePersonnel[i].value != "" &&
			professionalVendor.fullTimePersonnel[i].personnelId != null) {

			var vendorfullTimeId = uuidv1()
			if (vendorfullTimeList != "") {
				vendorfullTimeList += ",";
			}
			vendorfullTimeList += "('" + vendorfullTimeId +
				"', '" + professionalVendor.id +
				"', '" + professionalVendor.fullTimePersonnel[i].personnelId +
				"'," + professionalVendor.fullTimePersonnel[i].value + ")";
		}
	}
	if (vendorfullTimeList != '') {
		var dbQueryVendorFullTime = "INSERT INTO [dbo].[vendor_full_time_personnel] ( [Id], [VendorId], [PersonnelId], [Count])" +
			"VALUES " + vendorfullTimeList + ";";
		var result = await db.query(dbQueryVendorFullTime);

	}

	var dbQuerySectionCompleted = "UPDATE [professional_service_vendor] SET " +
		"IsFLPersonnelCompleted = 1" +
		" WHERE Id= '" + professionalVendor.id + "'";
	var result = await db.query(dbQuerySectionCompleted);

	additionalFullTimeList = "";
	for (var i = 0; i < professionalVendor.additionalfullTimePersonnel.length; i++) {
		if (additionalFullTimeList != "") {
			additionalFullTimeList += ",";
		}

		if (professionalVendor.additionalfullTimePersonnel[i].titleValue) {
			additionalFullTimeList += 'DisciplineTitle' + (i + 1) + "= '" +
				util.replaceQuotes(professionalVendor.additionalfullTimePersonnel[i].titleValue) + "'";
		} else {
			additionalFullTimeList += 'DisciplineTitle' + (i + 1) + " = NULL";
		}
		if (professionalVendor.additionalfullTimePersonnel[i].countValue) {
			additionalFullTimeList += ', DisciplineCount' + (i + 1) + "= " +
				professionalVendor.additionalfullTimePersonnel[i].countValue;
		} else {
			additionalFullTimeList += ', DisciplineCount' + (i + 1) + " = NULL";
		}

	}
	var dbQuery1 = "UPDATE [professional_service_vendor] SET " +
		additionalFullTimeList +
		" WHERE Id= '" + professionalVendor.id + "'";

	await db.query(dbQuery1);
	logger.trace("[professional_vendor_model] :: addFulltimePersonnelByVendorId() : End");
	return result.recordset;
}

// Delete existing full time personnel.
exports.deleteFullTimePersonnelByVendorId = async function (professionalVendor) {
	logger.debug("[professional_vendor_model] :: deleteFullTimePersonnelByVendorId() : Start");
	var deleteVendorPersonnelQuery = "DELETE FROM vendor_full_time_personnel WHERE VendorId = '" +
		professionalVendor.id + "';";
	var deletevendorFLPersonnelList = await db.query(deleteVendorPersonnelQuery);
	logger.trace("[professional_vendor_model] :: deleteFullTimePersonnelByVendorId() : End");
	return deletevendorFLPersonnelList.recordset;
}

// Get user id by vendor id.
exports.getUserIdByVendorId = async function (vendorId) {
	logger.debug("[professional_vendor_model] :: getUserIdByVendorId() : Start");
	var dbQuery = "SELECT UserId FROM [professional_service_vendor] WHERE Id= '" + vendorId + "'";
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getUserIdByVendorId() : End");
	return result.recordset;
}

// Check tax id availability.
exports.checkTaxIdAvailability = async function (inputValue, id) {
	logger.debug("[professional_vendor_model] :: checkTaxIdAvailability() : Start");
	var dbQuery = 'SELECT "taxIdAvailable" = CASE WHEN NumberofVendors = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofVendors FROM (SELECT [Id] FROM [user] WHERE TaxId= \'' + inputValue + '\' AND Id <> \'' + id + '\') AS y) AS x';
	var result = await db.query(dbQuery, [inputValue]);
	logger.trace("[professional_vendor_model] :: checkTaxIdAvailability() : End");
	return result.recordset;
};

// Check certification number availability.
exports.checkCertificationNoAvailability = async function (inputValue, id) {
	logger.debug("[professional_vendor_model] :: checkCertificationNoAvailability() : Start");
	var dbQuery = 'SELECT "certificationNoAvailable" = CASE WHEN NumberofVendors = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofVendors FROM (SELECT [Id] FROM [professional_service_vendor] WHERE CertificateNo= \'' + inputValue + '\' AND Id <> \'' + id + '\') AS y) AS x';
	var result = await db.query(dbQuery, [inputValue]);
	logger.trace("[professional_vendor_model] :: checkCertificationNoAvailability() : End");
	return result.recordset;
};

// Check tx board of prof. availability.
exports.checkTxBoardOfProfAvailability = async function (inputValue, id) {
	logger.debug("[professional_vendor_model] :: checkTxBoardOfProfAvailability() : Start");
	var dbQuery = 'SELECT "TxBoardOfProfAvailable" = CASE WHEN NumberofVendors = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofVendors FROM (SELECT [Id] FROM [professional_service_vendor] WHERE TxBoardOfProf= \'' + inputValue + '\' AND Id <> \'' + id + '\') AS y) AS x';
	var result = await db.query(dbQuery, [inputValue]);
	logger.trace("[professional_vendor_model] :: checkTxBoardOfProfAvailability() : End");
	return result.recordset;
};

// Get professional vendor by user id.
exports.getPSVendorByUserId = async function (userId) {
	logger.debug("[professional_vendor_model] :: getPSVendorByUserId() : Start");
	var dbQuery = 'SELECT * FROM professional_service_vendor WHERE UserId =\'' + userId + '\'';
	var result = await db.query(dbQuery, [userId]);
	logger.trace("[professional_vendor_model] :: getPSVendorByUserId() : End");
	return result.recordset;
};

// Get all states.
exports.getFullTimePersonnel = async function () {
	logger.debug("[professional_vendor_model] :: getFullTimePersonnel() : Start");
	var dbQuery = 'SELECT * FROM full_time_personnel';
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getFullTimePersonnel() : End");
	return result.recordset;
};

// Get full time personnel.
exports.getAllStates = async function () {
	logger.debug("[professional_vendor_model] :: getAllStates() : Start");
	var dbQuery = 'SELECT * FROM state';
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getAllStates() : End");
	return result.recordset;
};

// Get username, tax id and phone by user id.
exports.getUserInfoByUserId = async function (userId) {
	logger.debug("[professional_vendor_model] :: getUserInfoByUserId() : Start");
	var dbQuery = "SELECT [TaxId], [Company], [Email], [Phone] FROM [user] WHERE Id = '" + userId + "'";
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getUserInfoByUserId() : End");
	return result.recordset;
};

// get full time personnel list by vendor id.
exports.getFullTimePersonnelByVendorId = async function (vendorId) {
	logger.debug("[professional_vendor_model] :: getFullTimePersonnelByVendorId() : Start");
	var dbQuery = "SELECT full_time_personnel.Title,vendor_full_time_personnel.PersonnelId, vendor_full_time_personnel.Id, vendor_full_time_personnel.Count  FROM vendor_full_time_personnel INNER JOIN full_time_personnel " +
		"ON vendor_full_time_personnel.PersonnelId = full_time_personnel.Id " +
		"WHERE vendor_full_time_personnel.VendorId='" + vendorId + "'";
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getFullTimePersonnelByVendorId() : End");
	return result.recordset;
};

// get vendor offices by vendor id.
exports.getOfficesByVendorId = async function (vendorId) {
	logger.debug("[professional_vendor_model] :: getOfficesByVendorId() : Start");
	var dbQuery = "SELECT * FROM [vendor_office] WHERE VendorId = '" + vendorId + "'";
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getOfficesByVendorId() : End");
	return result.recordset;
};

// get vendor fees by vendor id
exports.getServiceFeesByVendorId = async function (vendorId) {
	logger.debug("[professional_vendor_model] :: getServiceFeesByVendorId() : Start");
	var dbQuery = "SELECT * FROM [vendor_service_fee] WHERE VendorId = '" + vendorId + "'";
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getServiceFeesByVendorId() : End");
	return result.recordset;
};

// Check tx board of prof. availability.
exports.getPSVendorProfileStatusByUserId = async function (userId) {
	logger.debug("[professional_vendor_model] :: getPSVendorProfileStatusByUserId() : Start");
	var dbQuery = 'SELECT "IsProfileComplete" = CASE WHEN NumberofVendors = 0 THEN 0 ELSE 1 END ' +
		'FROM (  SELECT COUNT(Id) AS NumberofVendors FROM [professional_service_vendor] WHERE ' +
		'IsProfileInfoCompleted = 1 AND ' +
		'IsPrincipalContInfoCompleted = 1 AND ' +
		'IsFLPersonnelCompleted = 1 AND ' +
		'IsPresentOfficesCompleted = 1 AND ' +
		'IsVendorFeesCompleted = 1 AND ' +
		'IsAccManagerInfoCompleted = 1 AND ' +
		'UserId = \'' + userId + '\') AS x';
	console.log(dbQuery)
	var result = await db.query(dbQuery, [userId]);
	logger.trace("[professional_vendor_model] :: getPSVendorProfileStatusByUserId() : End");
	return result.recordset;
};

exports.getResourceDocuments = async function () {
	logger.debug("[professional_vendor_model] :: getResourceDocuments() : Start");
	let PSResourceS3URL = 'https://' + process.env.S3_BUCKETNAME + '.s3.amazonaws.com' + config.get('S3Config.BucketPS') + '/';
	var dbQuery = `SELECT Id as psdocId, Name as name, 
                   CONCAT('` + PSResourceS3URL + `', Id, '.pdf') as downloadURL
                   FROM [professional_service_document] ORDER BY Name ASC`;
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getResourceDocuments() : End");
	return result.recordset;
}

// Get name, tax id and phone by vendor id.
exports.getUserInfoByVendorId = async function (vendorId) {
	logger.debug("[professional_vendor_model] :: getUserInfoByVendorId() : Start");
	var dbQuery = "SELECT Company, TaxId, Email, Phone FROM [user] WHERE Id = (SELECT UserId FROM [professional_service_vendor] WHERE Id = '" + vendorId + "')";
	var result = await db.query(dbQuery);
	logger.trace("[professional_vendor_model] :: getUserInfoByVendorId() : End");
	return result.recordset;
};
