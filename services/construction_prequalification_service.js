const logger = require('../util/log4jsutil');
const cpModel = require("../models/construction_prequalification_model");
const userModel = require("../models/user_model");
const mailUtil = require('../util/mailutil');
var empty = require('is-empty');
const uuidv1 = require('uuid/v1');
var config = require('config')
const s3 = require('../util/s3.config');
const logModel = require('../models/log_model')
const notificationModel = require("../models/notification_model");
const moment = require("moment")
const AWS = require('aws-sdk')
const JSZip = require("jszip");
const AWSLambda = require('../util/lambda.config');
//const request = require('request');


exports.getCPVendors = async function (status, noCPs) {
	logger.debug("[CP_service] :: getCPVendors() : Start");
	const cp = await cpModel.getCPVendors(status, noCPs);
	logger.trace("[CP_service] :: getCPVendors()  : End");
	return cp;
}

exports.updateCPstatus = async function (status, cpId, userId, comment, loggedUserId) {
	logger.debug("[CP_service] :: updateCPstatus() : Start");
	const statusId = await cpModel.getCPVendorsByStatus(status)
	if (!empty(statusId)) {
		const cp = await cpModel.updateCPstatus(statusId[0].Id, cpId, comment);
		// checklist implementation
		if (cp[0] > 0) {
			await cpModel.addCheckListHistoryData(cpId, statusId[0].Id);
			// Invoking the lambda function that zips old cp documents
			const lambda = AWSLambda.lambda;
			const params = AWSLambda.cpParams;
			params.Payload = JSON.stringify({
				cpId: cpId
			});
			lambda.invoke(params, function (err, data) {
				if (err) {
					console.log(err, err.stack);
				} else {
					console.log('Invoked');
				}
			});
		}
		const user = await userModel.getUserById(userId);
		if (!empty(user)) {
			//send the confirmation email
			const mailOptions = {
				//from: "", // Sender address
				to: user[0].Email,
				subject: "City of Houston Vendor Portal" + ' - Construction Prequalification Status Updated', // Subject line
				html: "<p>Hi " + user[0].UserName + "</p>" +
					"<p>Your construction prequalification status has been updated." +
					"<p> Please visit City of Houston's Vendor Portal to find out more. </p>" +
					"<a href='" + process.env.CLIENT_URL + "' target='_blank'>Take me to Vendor Portal</a>" +
					" </b></p>" +
					"<p>Thank You,</p>" +
					"<p>City of Houston Vendor Portal</p>"
			};

			const notification = {
				id: uuidv1(),
				userId: userId,
				level: 1,
				subject: 'Construction Prequalification Status Updated',
				body: mailOptions.html.replace(/'/g, "''"),
				sentTime: moment().format('YYYY-MM-DD HH:mm:ss')
			};
			await notificationModel.addNotification(notification);

			const mailSent = await mailUtil.sendMail(mailOptions);
			logger.debug("[CP_service] :: updateCPstatusr() : mailSent : {" + mailSent + " }");
			await logModel.addLog("Admin", config.get('ResourceTypes.ConstructionPrequalification'), "Construction Registration updated to " + status, loggedUserId == null ? '' : loggedUserId, loggedUserId)
			if (mailSent) {
				logger.trace("[CP_service] :: updateCPstatusr()  : End");
				return true;
			} else {
				throw new Error('Email sending failed');
			}
		}
	}
	logger.trace("[CP_service] :: updateCPstatus()  : End");
	return cp;
}

/*exports.uploadFinancialForm = async function(file) {
	logger.debug("[CP_service] :: uploadFinancialForm() : Start");
	logger.trace("[CP_service] :: uploadFinancialForm()  : End");
	return true;
}*/

/*exports.getCSResourceDocByName = async function(doc) {
	logger.debug("[CP_service] :: getCSResourceDocByName() : Start");
	const cpdoc = await cpModel.getCSResourceDocByName(doc);
	logger.trace("[CP_service] :: getCSResourceDocByName()  : End");
	return cpdoc;
}*/

exports.updateCPDocumentData = async function (document, files, userId) {
	logger.debug("[CP_service] :: updateCPDocumentData() : Start");
	let filenames = [];
	let resourceNames = [];
	let docIds = [];
	filenames = JSON.parse(document.filename);
	resourceNames = JSON.parse(document.resoureName)
	docIds = JSON.parse(document.docId);
	let isSectionCompleted = JSON.parse(document.isSectionCompleted);

	let documentIds = [];
	for (let i = 0; i < docIds.length; i++) {
		documentIds.push(docIds[i].substring(0, docIds[i].indexOf('+')));
	}
	let cpdoc = null;
	let cpId = null
	for (let i = 0; i < files.length; i++) {
		let cpdocId = uuidv1();
		await this.upload(cpdocId, files[i].buffer);
		// cpdoc = await cpModel.updateCPDocMapping(uuidv1(), document.cpId, cpdocId, document.categoryId, resourceNames[i], documentIds[i]);
		await cpModel.updateCPDocument(cpdocId, filenames[i], documentIds[i], uuidv1(),
			document.cpId, document.categoryId, resourceNames[i]);
		await cpModel.updateConstructionPrequalification(document.completedSection, document.cpId, isSectionCompleted)
		cpId = document.cpId
	}
	var cpItem = await cpModel.getVendorIdByCPId(cpId)
	if (cpItem.length > 0) {
		let section = "";
		if (document.completedSection == "financial") {
			section = "Financial Stability";
		} else if (document.completedSection == "safety") {
			section = "Safety Statement";
		} else if (document.completedSection == "litigation") {
			section = "Existence of Past or Present Litigation";
		} else if (document.completedSection == "environment") {
			section = "Environmental Statement";
		} else if (document.completedSection == "hireHouston") {
			section = "Hire Houston First";
		} else if (document.completedSection == "other") {
			section = "Other Documents";
		}
		await logModel.addLog("cs vendor", config.get('ResourceTypes.ConstructionPrequalification'),
			section + " of Construction Registration updated", cpItem[0].VendorId, userId)
	}
	logger.trace("[CP_service] :: updateCPDocumentData()  : End");
	return cpdoc;
}

exports.getCPDataByVendorId = async function (data) {
	logger.debug("[CP_service] :: updateCPDocumentData() : Start");
	const cpData = await cpModel.getCPDataByVendorId(data.Id);
	logger.trace("[CP_service] :: updateCPDocumentData()  : End");
	return cpData;
}

exports.getCPDocAndCategory = async function () {
	logger.debug("[CP_service] :: updateCPDocumentData() : Start");
	const cp = await cpModel.getCPDocAndCategory();
	logger.trace("[CP_service] :: updateCPDocumentData()  : End");
	return cp;
}
exports.updateConstructionPrequalification = async function (params) {
	logger.debug("[CP_service] :: updateConstructionPrequalification() : Start");
	const result = await cpModel.updateConstructionPrequalification(params);
	logger.trace("[CP_service] :: updateConstructionPrequalification()  : End");
	return result;
}

exports.getCpDataByCategoryAndCPId = async function (doc) {
	logger.debug("[CP_service] :: getCpDataByCategoryAndCPId() : Start");
	const cpdoc = await cpModel.getCpDataByCategoryAndCPId(doc);
	logger.trace("[CP_service] :: getCpDataByCategoryAndCPId()  : End");
	return cpdoc;
}

exports.upload = async function (Id, fileData) {
	logger.debug("[CP_service] :: upload() : Start");
	const s3Client = s3.s3Client;
	const params = s3.uploadParams;
	params.Key = Id + '.pdf';
	params.Body = fileData;
	params.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketCP')
	//process.env.S3_BUCKETNAME
	params.ACL = config.get('S3Config.AuthenticatedACL')
	params.ContentType = config.get('S3Config.ContentType')
	const doc = new Promise((resolve, reject) => {
		s3Client.upload(params, function (err, data) {
			if (err) {
				reject();
				throw new Error(err.code);
			} else {
				resolve();
				console.log("Upload success", data)
			}
		});
	});
	logger.trace("[CP_service] :: upload()  : End");
	return doc;
}

exports.setCPStatus = async function (params, userId) {
	logger.debug("[CP_service] :: setCPStatus() : Start");
	const result = await cpModel.setCPStatus(params.cpId, params.status);
	var cpItem = await cpModel.getVendorIdByCPId(params.cpId)
	if (cpItem.length > 0) {
		await logModel.addLog("cs vendor", config.get('ResourceTypes.ConstructionPrequalification'), "Construction Registration submitted", cpItem[0].VendorId, userId)
	}
	logger.trace("[CP_service] :: setCPStatus()  : End");
	return result;
}

exports.getSearchResults = async function (params, noCPs, status) {
	logger.debug("[CP_servic] :: getSearchResults() : Start");
	const result = await cpModel.getSearchResults(params.value, noCPs, status);
	logger.trace("[CP_servic] :: getSearchResults()  : End");
	return result;
}

//Add new record into construction_prequalification table
exports.addConstructionPrequalification = async function (data, userId) {
	logger.debug("[CP_service] :: addConstructionPrequalification() : Start");
	var cpId = uuidv1(); //generate primary key
	const result = await cpModel.addConstructionPrequalification(cpId, data.vendorId);
	await logModel.addLog("cs vendor", config.get('ResourceTypes.ConstructionPrequalification'), "Construction Registration created", data.vendorId, userId)
	logger.trace("[CP_service] :: addConstructionPrequalification()  : End");
	return result;
}

// Save checklist
exports.saveCheckListData = async function (checklistObj, userId) {
	logger.debug("[CP_service] :: saveCheckListData() : Start")
	const now = moment().format("YYYY-MM-DD HH:mm:ss")
	let checklistData = [];
	let identifierList = [];
	let saveCLresult = [];

	if (checklistObj.status == "Completed" && (Object.keys(checklistObj.checklist).length == 0)) { // Submitting pre saved completed checklist
		saveCLresult = [1];
	} else {
		for (const [key, value] of Object.entries(checklistObj.checklist)) {
			let row = `('${uuidv1()}', '${checklistObj.cpId}', '${key}', '${value}', '${userId}', '${now}')`
			checklistData.push(row);
			identifierList.push(`'${key}'`);
		}
		await cpModel.deleteCheckListDataByCPIdAndIdentifier(checklistObj.cpId, identifierList);
		saveCLresult = await cpModel.saveCheckListData(checklistData);
	}

	if (saveCLresult[0] > 0) {
		const clStatus = await cpModel.changeCheckListStatus(uuidv1(), checklistObj.cpId, checklistObj.status, userId, now)
		if (checklistObj.status == "Completed" && clStatus[0] > 0) {
			//await cpModel.addCheckListHistoryData(checklistObj.cpId);
			await logModel.addLog("Admin", config.get('ResourceTypes.ConstructionPrequalification'),
				`Construction registration checklist status of ${checklistObj.companyName} has changed to ${checklistObj.status}`, userId == null ? '' : userId,
				userId);
		}
	}

	// send email to admins once financial disclosure completed by cs admin
	const userRole = await userModel.getUserRolesByUserId(userId);
	if (userRole[0].Description == 'cs admin') {
		if (('chkFD' in checklistObj.checklist) && checklistObj.checklist.chkFD) {
			const emails = await userModel.getAdminEmails();
			const emailList = emails.map((item) => {
				return item['Email'];
			});
			const mailOptions = {
				to: emailList,
				subject: "Construction Vendor - Financial Disclosure Completed", // Subject line
				html: `<p>Dear City of Admin User</p>` +
					`<p>The financial disclosure section for Vendor: ${checklistObj.companyName} is completed.</p>` +
					`<p>You may access this checklist by selecting ` +
					`<a href="${process.env.CLIENT_URL}/login/admin" target='_blank'>here</a>.</p>` +
					`<p>Thank You.</p>`
			};
			const mailSent = await mailUtil.sendMail(mailOptions);
			logger.debug("[CP_service] :: saveCheckListData() : mailSent : {" + mailSent + " }");
			if (mailSent) {
				logger.trace("[CP_service] :: saveCheckListData()  : End");
				return true;
			} else {
				throw new Error('Email sending failed');
			}
		}
	}

	logger.trace("[CP_service] :: saveCheckListData()  : End");
	return saveCLresult;
}

// Get checklist data by cp Id
exports.getCheckListByCPId = async function (cpId) {
	logger.debug("[CP_service] :: getCheckListByCPId() : Start");
	const result = await cpModel.getCheckListByCPId(cpId);
	logger.trace("[CP_service] :: getCheckListByCPId()  : End");
	return result;
}

