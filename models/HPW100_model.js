const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const uuidv1 = require('uuid/v1');
const util = require('../util/basicutil')
const professionalVendorModel = require("./professional_vendor_model");
const userModel = require("./user_model")

exports.addHPW100 = async function (hpw100) {
	logger.debug("[HPW100_model] :: addHPW100() : Start");
	var dbQuery = "INSERT INTO [dbo].[HPW100] ([Id], [VendorId], [ProjectTypeId], [StatusId])" +
		"VALUES ('" + hpw100.id +
		"', '" + hpw100.vendorId +
		"', '" + hpw100.projectTypeId +
		"', '" + hpw100.statusId + "');";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: addHPW100() : End");
	return result.recordset;
}

exports.addWorkExperience = async function (hpw100) {
	logger.debug("[HPW100_model] :: addWorkExperience() : Start");
	let workExpList = "";
	for (var i = 0; i < hpw100.workExperience.length; i++) {
		var item = hpw100.workExperience[i]
		var startDate = ''
		if (item.startDate) {
			startDate = item.startDate
		}
		var completionDate = null;
		if (item.completionDate) {
			completionDate = item.completionDate
		}
		if (workExpList != "") {
			workExpList += ",";
		}

		if (completionDate !== null) {
			workExpList += "('" + uuidv1() +
				"', '" + hpw100.id +
				"', '" + util.replaceQuotes(item.projectName) + "', '" + item.location + "', '" + item.companyTypeId +
				"', '" + startDate + "', '" + completionDate + "', '" + item.cost.replace('$', "") +
				"', '" + util.replaceQuotes(item.responsibilityNature) + "', '" + util.replaceQuotes(item.projectOwner) + "', '" + util.replaceQuotes(item.ownerAddress) + "', '" + util.replaceQuotes(item.ownerCity) + "', '" + util.replaceQuotes(item.ownerState) +
				"', '" + util.replaceQuotes(item.ownerZipcode) + "', '" + util.replaceQuotes(item.contactPerson) + "', '" + item.contactPersonPhone +
				"')";
		} else {
			workExpList += "('" + uuidv1() +
				"', '" + hpw100.id +
				"', '" + util.replaceQuotes(item.projectName) + "', '" + item.location + "', '" + item.companyTypeId +
				"', '" + startDate + "', null , '" + item.cost.replace('$', "") +
				"', '" + util.replaceQuotes(item.responsibilityNature) + "', '" + util.replaceQuotes(item.projectOwner) + "', '" + util.replaceQuotes(item.ownerAddress) + "', '" + util.replaceQuotes(item.ownerCity) + "', '" + util.replaceQuotes(item.ownerState) +
				"', '" + util.replaceQuotes(item.ownerZipcode) + "', '" + util.replaceQuotes(item.contactPerson) + "', '" + item.contactPersonPhone +
				"')";
		}
	}


	if (workExpList) {

		var dbQuery = "INSERT INTO [dbo].[work_experience] ([Id], [HPW100Id], [ProjectName], [Location], [CompanyTypeId], [StartDate], [CompletionDate], [Cost], [ResponsibilityNature], [ProjectOwner], [OwnerAddress], [OwnerCity], [OwnerState], [OwnerZipcode], [ContactPerson], [ContactPersonPhone])" +
			" VALUES " + workExpList + ";";
		var result = await db.query(dbQuery);
		return result.recordset;
	}
	logger.debug("[HPW100_model] :: addWorkExperience() : Start");
}

exports.deleteHPW100 = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: deleteHPW100() : Start");
	var dbQuery = "DELETE FROM [hpw100] WHERE Id= '" + hpw100Id + "'";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: deleteHPW100() : End");
	return result.recordset;
}

exports.deleteWorkExperienceByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: deleteWorkExperienceByHPW100Id() : Start");
	var dbQuery = "DELETE FROM [work_experience] WHERE HPW100Id= '" + hpw100Id + "'";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: deleteWorkExperienceByHPW100Id() : End");
	return result.recordset;
}

exports.getHPW100StatusByStatusId = async function (status) {
	logger.debug("[HPW100_model] :: getHPW100StatusByStatusId() : Start");
	var dbQuery = "SELECT Id FROM [HPW100_status] WHERE Status= '" + status + "'";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100StatusByStatusId() : End");
	return result.recordset;
}

exports.getHPW100ByVendorId = async function (vendorId) {
	logger.debug("[HPW100_model] :: getHPW100ByVendorId() : Start");
	var dbQuery = "SELECT [HPW100].Id, [HPW100].ProjectTypeId,[HPW100].IsExpired,  [HPW100].StatusId, [HPW100_status].Status AS Status, [project_type].Type AS ProjectType, [project_type].Status AS ProjectTypeStatus " +
		"FROM [HPW100] " +
		"LEFT JOIN [HPW100_status] ON [HPW100_status].Id = [HPW100].StatusId " +
		"LEFT JOIN [project_type] ON [project_type].Id = [HPW100].ProjectTypeId " +
		"WHERE VendorId= '" + vendorId + "' " +
		"ORDER BY [project_type].Type "
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100ByVendorId() : End");
	return result.recordset;
}

exports.getHPW100ByVendorIdAndStatuSubmitted = async function (vendorId) {
	logger.debug("[HPW100_model] :: getHPW100ByVendorId() : Start");
	var dbQuery = "SELECT [HPW100].Id, [HPW100].ProjectTypeId, [HPW100].StatusId, [HPW100_status].Status AS Status, [project_type].Type AS ProjectType, [project_type].Status AS ProjectTypeStatus " +
		"FROM [HPW100] " +
		"LEFT JOIN [HPW100_status] ON [HPW100_status].Id = [HPW100].StatusId " +
		"LEFT JOIN [project_type] ON [project_type].Id = [HPW100].ProjectTypeId " +
		"WHERE VendorId= '" + vendorId + "' AND [HPW100_status].Status = 'Submitted' " +
		"ORDER BY [project_type].Type "
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100ByVendorId() : End");
	return result.recordset;
}

exports.getWorkExperiencesByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: getWorkExperiencesByHPW100Id() : Start");
	var dbQuery = "SELECT [work_experience].*, [company_type].Type AS CompanyTypeDesc, [state].State AS LocationDesc,  ownerstate.State AS OwnerStateDesc " +
		"FROM [work_experience] " +
		"LEFT JOIN [company_type] ON [company_type].Id = [work_experience].CompanyTypeId " +
		"LEFT JOIN [state] ON [state].State_Code = [work_experience].Location " +
		"LEFT JOIN [state] AS ownerstate ON ownerstate.State_Code = [work_experience].OwnerState " +
		"WHERE HPW100Id= '" + hpw100Id + "'";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getWorkExperiencesByHPW100Id() : End");
	return result.recordset;
}

exports.getCompanyTypes = async function () {
	logger.debug("[HPW100_model] :: getCompanyTypes() : Start");
	var dbQuery = "SELECT Id, Type FROM [company_type] ORDER BY TYPE ASC";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getCompanyTypes() : End");
	return result.recordset;
}

exports.getProjectTypesByVendorHPWs = async function (vendorId) {
	logger.debug("[HPW100_model] :: getProjectTypesByVendorHPWs() : Start");
	var dbQuery = "SELECT Id, Type FROM [project_type] " +
		"WHERE [project_type].Id NOT IN (SELECT [HPW100].ProjectTypeId FROM [HPW100] WHERE VendorId = '" + vendorId + "') " +
		"AND [project_type].Status = 1 ORDER BY [project_type].Type ASC";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getProjectTypesByVendorHPWs() : End");
	return result.recordset;
}

//This will insert new record to the HPW100_profile table
exports.addHPW100Profile = async function (vendorId, hpw100Id) {
	logger.debug("[HPW100_model] :: addHPW100Profile() : Start");
	var userId = await professionalVendorModel.getUserIdByVendorId(vendorId)
	if (userId.length > 0) {
		var userInfo = await userModel.getUserById(userId[0].UserId)
		if (userInfo.length > 0) {
			var deleteQuery = `DELETE FROM [HPW100_profile] WHERE HPW100Id IN ('${hpw100Id}')`;
			await db.query(deleteQuery);
			var dbQuery = "INSERT INTO [HPW100_profile] " +
				"([Id],[Vendor],[HPW100Id],[ACManagerName],[ACManagerPhone],[ACManagerEmail],[FirmName] " +
				",[Mailing],[BusinessAddress],[YearEstablished],[HoustonOffice],[ParentCompany],[Phone],[CertificateNo] " +
				",[TxBoardOfProf],[PrincipalName],[PrincipalTitle],[PrincipalEmail],[PrincipalPhone],[DisciplineTitle1] " +
				",[DisciplineTitle2],[DisciplineTitle3],[DisciplineTitle4],[DisciplineCount1],[DisciplineCount2],[DisciplineCount3] " +
				",[DisciplineCount4],[TotalPersonnel],[FirmTotalPersonnel],[BusinessAddrCity],[BusinessAddrState],[BusinessAddrZipcode] " +
				",[MailingAddress],[MailingAddrCity],[MailingAddrState],[MailingAddrZipcode],[Website],[VendorNo],[DBA],[IsCertified],[TaxId],[CompanyPhone],[CompanyEmail]) " +
				"SELECT NEWID(), " +
				"[Vendor], '" + hpw100Id + "', " +
				"[ActMgrName],[ActMgrPhone],[ActMgrEmail],[FirmName],[Mailing],[BusinessAddress],[YearEstablished],[HoustonOffice] " +
				",[ParentCompany],[Phone],[CertificateNo],[TxBoardOfProf],[PrincipalName],[PrincipalTitle],[PrincipalEmail],[PrincipalPhone] " +
				",[DisciplineTitle1],[DisciplineTitle2],[DisciplineTitle3],[DisciplineTitle4],[DisciplineCount1],[DisciplineCount2] " +
				",[DisciplineCount3],[DisciplineCount4],[TotalPersonnel],[FirmTotalPersonnel],[BusinessAddrCity],[BusinessAddrState] " +
				",[BusinessAddrZipcode],[MailingAddress],[MailingAddrCity],[MailingAddrState],[MailingAddrZipcode],[Website],[VendorNo],[DBA],[IsCertified], '" + userInfo[0].TaxId + "','" + userInfo[0].Phone + "', '" + userInfo[0].Email + "' " +
				"FROM [professional_service_vendor] " +
				"WHERE Id = '" + vendorId + "'";
			var result = await db.query(dbQuery);
			logger.debug("[HPW100_model] :: addHPW100Profile() : End");
			return result.recordset;
		} else {
			throw new Error("Could not retrive user info.")
		}
	} else {
		throw new Error("User not found.")
	}
}

//This will insert new record to the HPW100_full_time_personnel table
exports.addHPW100FullTimePersonnel = async function (vendorId, hpw100Id) {
	logger.debug("[HPW100_model] :: addHPW100FullTimePersonnel() : Start");
	var deleteQuery = `DELETE FROM [HPW100_full_time_personnel] WHERE HPW100Id IN ('${hpw100Id}')`;
	await db.query(deleteQuery);

	//insert into full time personnel for the HPW100 and Personnel inserted in the previous step
	var dbQuery = "INSERT INTO [HPW100_full_time_personnel] ([Id],[HPW100Id],[PersonnelId],[Count])" +
		"SELECT  NEWID(),'" + hpw100Id + "', PersonnelId , Count FROM [vendor_full_time_personnel] WHERE [VendorId] = '" + vendorId + "'";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: addHPW100FullTimePersonnel() : End");
	return result.recordset;
}

//This will insert new record to the HPW100_office table
exports.addHPW100Office = async function (vendorId, hpw100Id) {
	logger.debug("[HPW100_model] :: addHPW100Office() : Start");
	var deleteQuery = `DELETE FROM [HPW100_office] WHERE HPW100Id IN ('${hpw100Id}')`;
	await db.query(deleteQuery);
	var dbQuery = "INSERT INTO [HPW100_office] " +
		"([Id],[HPW100Id],[City],[State],[OfficePersonnel],[Phone]) " +
		"SELECT NEWID(), '" + hpw100Id + "', [City],[State],[OfficePersonnel],[Phone] " +
		"FROM [vendor_office] " +
		"WHERE VendorId = '" + vendorId + "'";

	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: addHPW100Office() : End");
	return result.recordset;
}

//This will insert new record to the HPW100_service_fee table
exports.addHPW100ServiceFee = async function (vendorId, hpw100Id) {
	logger.debug("[HPW100_model] :: addHPW100ServiceFee() : Start");
	var deleteQuery = `DELETE FROM [HPW100_service_fee] WHERE HPW100Id IN ('${hpw100Id}')`;
	await db.query(deleteQuery);
	var dbQuery = "INSERT INTO [HPW100_service_fee] " +
		"([Id],[HPW100Id],[Year],[ContractWork],[TotalFees],[FirmTotalFees]) " +
		"SELECT NEWID(), '" + hpw100Id + "', [Year],[ContractWork],[TotalFee],[FirmTotalFee] " +
		"FROM [vendor_service_fee] " +
		"WHERE VendorId = '" + vendorId + "'";

	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: addHPW100ServiceFee() : End");
	return result.recordset;
}

//This will delete records from HPW100_profile, HPW100_full_time_personnel, 
//HPW100_office and HPW100_service_fee tables
exports.deleteHPW100ProfileDetails = async function (hpw100Ids) {
	logger.debug("[HPW100_model] :: deleteHPW100ProfileDetails() : Start");
	var dbQuery1 = "DELETE FROM [HPW100_profile] WHERE HPW100Id IN (" + hpw100Ids + ")";
	var result2 = await db.query(dbQuery1);
	var dbQuery2 = "DELETE FROM [HPW100_full_time_personnel] WHERE HPW100Id IN (" + hpw100Ids + ")";
	var result1 = await db.query(dbQuery2);
	var dbQuery3 = "DELETE FROM [HPW100_office] WHERE HPW100Id IN (" + hpw100Ids + ")";
	var result1 = await db.query(dbQuery3);
	var dbQuery4 = "DELETE FROM [HPW100_service_fee] WHERE HPW100Id IN (" + hpw100Ids + ")";
	var result1 = await db.query(dbQuery4);
	logger.debug("[HPW100_model] :: deleteHPW100ProfileDetails() : End");
}

//This will return the status Id of a given hpw100
exports.getHPW100StatusByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: getHPW100StatusByHPW100Id() : Start");
	var dbQuery = `SELECT StatusId FROM [HPW100] WHERE Id = '${hpw100Id}'`;

	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100StatusByHPW100Id() : End");
	return result.recordset;
}

//Get HPW 100 vendor profile  by hpw100Id
exports.getHPW100VendorProfileByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: getHPW100VendorProfileByHPW100Id() : Start");
	var dbQuery = "SELECT [HPW100_profile].*, business_state.state AS BusinessAddrStateDesc, mailing_state.state AS MailingAddrStateDesc FROM [HPW100_profile] " +
		"LEFT JOIN state business_state ON business_state.state_code = [HPW100_profile].[BusinessAddrState] " +
		"LEFT JOIN state mailing_state ON mailing_state.state_code = [HPW100_profile].[MailingAddrState] " +
		"WHERE HPW100Id = '" + hpw100Id + "'";

	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100VendorProfileByHPW100Id() : End");
	return result.recordset;
}

//Get HPW 100 office information by hpw100Id
exports.getHPW100OfficeByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: getHPW100OfficeByHPW100Id() : Start");
	var dbQuery = "SELECT [HPW100_office].*, state.state AS StateDesc FROM [HPW100_office] " +
		"LEFT JOIN state ON state.state_code = [HPW100_office].[State] " +
		"WHERE HPW100Id = '" + hpw100Id + "'";

	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100OfficeByHPW100Id() : End");
	return result.recordset;
}

//Get HPW 100 service fee information by hpw100Id
exports.getHPW100ServiceFeeByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: getHPW100ServiceFeeByHPW100Id() : Start");
	var dbQuery = "SELECT * FROM [HPW100_service_fee] WHERE HPW100Id = '" + hpw100Id + "' ORDER BY [Year] Desc";

	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100ServiceFeeByHPW100Id() : End");
	return result.recordset;
}

//Get HPW 100 full time personnel inforfull_time_personemation by hpw100Id
exports.getHPW100FullTimePersonnelByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: getHPW100FullTimePersonnelByHPW100Id() : Start");
	var dbQuery = "SELECT [full_time_personnel].Title AS Title, [HPW100_full_time_personnel].Count FROM [HPW100_full_time_personnel] " +
		"LEFT JOIN [full_time_personnel] ON [full_time_personnel].Id = [HPW100_full_time_personnel].PersonnelId " +
		"WHERE [HPW100_full_time_personnel].HPW100Id = '" + hpw100Id + "' ORDER BY [full_time_personnel].[Title] Asc";

	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100FullTimePersonnelByHPW100Id() : End");
	return result.recordset;
}

// Set HPW100 status 
exports.setHPW100Status = async function (hpw100Id, statusId) {
	logger.debug("[SOQ_model] :: setHPW100Status() : Start");
	var dbQuery = "UPDATE [HPW100] SET [HPW100].StatusId = '" + statusId + "' WHERE Id = '" + hpw100Id + "'";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: setHPW100Status() : End");
	return result.recordset;
}


// Get HPW100_Status id for the Submitted status
exports.getHPW100SubmittedStatusId = async function () {
	logger.debug("[SOQ_model] :: getHPW100SubmittedStatusId() : Start");
	var dbQuery = `SELECT Id FROM [HPW100_status] WHERE [HPW100_status].Status = 'Submitted'`;
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getHPW100SubmittedStatusId() : End");
	return result.recordset;
}

// Get HPW100_Status id for the Pending status
exports.getHPW100PendingStatusId = async function () {
	logger.debug("[SOQ_model] :: getHPW100PendingStatusId() : Start");
	var dbQuery = `SELECT Id FROM [HPW100_status] WHERE [HPW100_status].Status = 'Pending'`;
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: getHPW100PendingStatusId() : End");
	return result.recordset;
}

// Set HPW100s status to Pending
exports.setHPW100StatusToPending = async function (hpw100Ids) {
	logger.debug("[SOQ_model] :: setHPW100StatusToPending() : Start");
	const hpw100PendingStatus = await this.getHPW100PendingStatusId() // get HPW100 pending id
	var dbQuery = "UPDATE [HPW100] SET [HPW100].StatusId = '" + hpw100PendingStatus[0].Id + "' WHERE Id IN  (" + hpw100Ids + ")";
	var result = await db.query(dbQuery);
	logger.debug("[SOQ_model] :: setHPW100StatusToPending() : End");
	return result.recordset;
}

//get the project type of a hpw 100
exports.getHPW100ProjectTypeByHPW100Id = async function (hpw100Id) {
	logger.debug("[HPW100_model] :: getHPW100ProjectTypeByHPW100Id() : Start");
	var dbQuery = "SELECT [project_type].Type AS Type FROM [HPW100] " +
		"LEFT JOIN [project_type] ON [project_type].Id = [HPW100].ProjectTypeId " +
		"WHERE [HPW100].Id = '" + hpw100Id + "'";
	var result = await db.query(dbQuery);
	logger.debug("[HPW100_model] :: getHPW100ProjectTypeByHPW100Id() : End");
	return result.recordset;
}

// Update submittal time for HPW100 by Id
exports.setSubmitTime = async function (hpw100Id, submitTime) {
	logger.debug("[HPW100_model] :: setSubmitTime() : Start");
	const dbQuery = `UPDATE [HPW100] SET [SubmitTime] = '${submitTime}', [IsExpired] = '0' WHERE [Id] = '${hpw100Id}'`;
	const result = await db.query(dbQuery);
	logger.trace("[HPW100_model] :: setSubmitTime() : End");
	return result.rowsAffected;
}

// Update expiry status of HPW100
exports.updateHPW100ExpiryStatus = async (hpw100Id) => {
	logger.debug("[HPW100_model] :: updateHPW100ExpiryStatus() : Start");
	const dbQuery = `UPDATE [HPW100] SET [IsExpired]='0' WHERE Id ='${hpw100Id}'`;
	const result = await db.query(dbQuery);
	logger.trace("[HPW100_model] :: updateHPW100ExpiryStatus() : End");
	return result.rowsAffected;
};
