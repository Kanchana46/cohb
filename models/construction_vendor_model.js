const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
var config = require('config');
const util = require('../util/basicutil');

exports.getResourceDocuments = async function () {
	logger.debug("[construction_vendor_model] :: getResourceDocuments() : Start");
	let CSResourceS3URL = 'https://' + process.env.S3_BUCKETNAME + '.s3.amazonaws.com' + config.get('S3Config.BucketCS') + '/';
	var dbQuery = `SELECT Id as csdocId, Name as name, 
                   CONCAT('` + CSResourceS3URL + `',Id, '.pdf') as downloadURL
                   FROM [construction_service_document] ORDER BY Name ASC`;
	logger.trace("dbQuery" + dbQuery);
	var result = await db.query(dbQuery);
	logger.trace("[construction_vendor_model] :: getResourceDocuments() : End");
	return result.recordset;
}

exports.getCSVendorInfo = async function (userId) {
	logger.debug("[construction_vendor_model] :: getCSVendorInfo() : Start");
	var dbQuery = `SELECT [user].Id, Vendor, [user].Company, [construction_vendor].Status, [user].TaxId, VendorNo, DBA, BusinessAddress, BusinessAddrCity, BusinessAddrState,
                   BusinessAddrZipcode, IsMailingAddrSame, MailingAddress, MailingAddrCity, MailingAddrState, MailingAddrZipcode,
                   IsHoustonOfcPresent, IsHoustonOfcParentComp, ParentCompany, Website, PrincipalName, PrincipalEmail, PrincipalPhone,
				   Certified, Contact, [user].Email, [user].Phone, CertificationNo, YearEstablished, IsProfileCompleted, PrincipalTitle, ActMgrName, ActMgrEmail, 
				   ActMgrPhone, IsAccManagerInfoCompleted, HoustonOffice, IsLockedByAdmin 
                   FROM [construction_vendor] left join [user] on [user].Id = [construction_vendor].UserId  where [user].Id = '${userId}' AND [user].company != 'COH'`;
	var result = await db.query(dbQuery);
	logger.trace("[construction_vendor_model] :: getCSVendorInfo() : End");
	return result.recordset;
}

exports.checkCertificationNoAvailability = async function (inputValue, Id) {
	logger.debug("[construction_vendor_model] :: checkCertificationNoAvailability() : Start");
	var dbQuery = `SELECT "certificationNoAvailable" = 
                    CASE 
                        WHEN NumberofVendors = 0 THEN 1 
                    ELSE 0 
                    END 
                    FROM (SELECT COUNT(Id) AS NumberofVendors FROM (SELECT [Id] FROM [construction_vendor] WHERE CertificationNo = '${inputValue}' AND UserId <> '${Id}') AS y) AS x`;
	console.log(dbQuery)
	var result = await db.query(dbQuery, [inputValue]);
	logger.trace("[construction_vendor_model] :: checkCertificationNoAvailability() : End");
	return result.recordset;
};

exports.saveVendorProfileData = async function (vendor) {
	logger.debug("[construction_vendor_model] :: saveVendorProfileData() : Start");
	let query1 = ``;
	let query2 = ``;
	let query3 = ``;
	let query4 = ``;
	let query5 = ``;
	if (vendor.houstonOffice === null) {
		query1 = `IsHoustonOfcParentComp = ${vendor.houstonOffice}`;
		query2 = `HoustonOffice = ${vendor.houstonOffice}`;
	} else {
		query1 = `IsHoustonOfcParentComp = '${vendor.houstonOffice}'`;
		query2 = `HoustonOffice = '${vendor.houstonOffice === '1' ? 'Parent Company' : 'Branch/Subsidiary'}'`;
	}
	if (vendor.parentCompany === null) {
		query3 = `ParentCompany = ${vendor.parentCompany}`;
	} else {
		query3 = `ParentCompany = '${util.replaceQuotes(vendor.parentCompany)}'`;
	}
	if (vendor.year === null) {
		query4 = `YearEstablished = ${vendor.year}`;
	} else {
		query4 = `YearEstablished = '${vendor.year}'`;
	}
	if (vendor.website === null) {
		query5 = `Website = ${vendor.website}`;
	} else {
		query5 = `Website = '${vendor.website}'`;
	}

	var dbQuery = `UPDATE [construction_vendor] SET Vendor = '${vendor.vendorName == null ? '' : util.replaceQuotes(vendor.vendorName)}', 
                   BusinessAddress = '${vendor.businessAddress == null ? '' : util.replaceQuotes(vendor.businessAddress)}',
                   VendorNo = '${vendor.vendorNo == null ? '' : util.replaceQuotes(vendor.vendorNo)}',
				   DBA = '${vendor.dba == null ? '' : util.replaceQuotes(vendor.dba)}',
                   BusinessAddrCity = '${vendor.city == null ? '' : util.replaceQuotes(vendor.city)}', 
				   BusinessAddrState = '${vendor.state == null ? '' : vendor.state.value}', 
                   BusinessAddrZipcode = '${vendor.zip == null ? '' : util.replaceQuotes(vendor.zip)}',
                   IsMailingAddrSame = '${vendor.isSameMail}', 
				   MailingAddress = '${vendor.mailingAddress == null ? '' : vendor.mailingAddress}', 
                   MailingAddrCity = '${vendor.mailingCity == null ? '' : util.replaceQuotes(vendor.mailingCity)}',
                   MailingAddrState = '${vendor.mailingState == null ? '' : vendor.mailingState.value}', 
				   MailingAddrZipcode = '${vendor.mailingZip == null ? '' : util.replaceQuotes(vendor.mailingZip)}', 
                   IsHoustonOfcPresent = '${vendor.hasHoustonOffice}', ${query1}, ${query2}, ${query3}, ${query4}, ${query5},
                   PrincipalName = '${vendor.principalName == null ? '' : util.replaceQuotes(vendor.principalName)}', 
                   PrincipalEmail= '${vendor.email == null ? '' : vendor.email}', 
                   PrincipalPhone = '${vendor.companyPhone == null ? '' : vendor.companyPhone}', 
				   Certified = '${vendor.isCohCertified}', 
				   Phone= '${vendor.phone == null ? '' : vendor.phone}', 
                   CertificationNo = '${vendor.certificationNo == null ? '' : util.replaceQuotes(vendor.certificationNo)}',
				   PrincipalTitle = '${vendor.principalTitle == null ? '' : util.replaceQuotes(vendor.principalTitle)}', 
				   IsProfileCompleted = '${vendor.isFormCompleted}'
                   WHERE UserId = '${vendor.id}'`;
	var result = await db.query(dbQuery);

	var dbUserQuery = `UPDATE [user] SET Company = '${vendor.vendorName == null ? '' : util.replaceQuotes(vendor.vendorName)}', 
						Phone = '${vendor.phone == null ? '' : vendor.phone}' 
						WHERE Id = '${vendor.id}'`;
	var result = await db.query(dbUserQuery);

	logger.trace("[construction_vendor_model] :: saveVendorProfileData() : End");

	return result.recordset;
}

exports.saveAccountManagerData = async function (accManager) {
	logger.debug("[construction_vendor_model] :: saveVendorProfileData() : Start");
	var dbQuery = `UPDATE [construction_vendor] SET 
                   ActMgrName = '${accManager.accManagerName == null ? "" : util.replaceQuotes(accManager.accManagerName)}', 
                   ActMgrEmail = '${accManager.accManagerEmail == null ? "" : accManager.accManagerEmail}', 
                   ActMgrPhone = '${accManager.accManagerPhone == null ? "" : accManager.accManagerPhone}',
                   IsAccManagerInfoCompleted = '${accManager.isFormCompleted}'
                   WHERE UserId = '${accManager.id}'`;
	var result = await db.query(dbQuery);
	logger.trace("[construction_vendor_model] :: saveVendorProfileData() : End");
	return result.recordset;
}

exports.getCSVendorIdByUserId = async function (userId) {
	logger.debug("[construction_vendor_model] :: getCSVendorIdByUserId() : Start");
	var dbQuery = "SELECT Id FROM construction_vendor WHERE UserId='" + userId + "'"
	var result = await db.query(dbQuery);
	logger.trace("[construction_vendor_model] :: getCSVendorIdByUserId() : End");
	return result.recordset;
}