const aws = require('aws-sdk')
var fs = require('fs-extra')
const logger = require('../util/log4jsutil');
var config = require('config')
const rfqModel = require("../models/RFQ_model");
var stream = require('stream');
const s3 = require('../util/s3.config');
let upload = require('../util/multer.config');
const uuidv1 = require('uuid/v1');
var empty = require('is-empty');
const userModel = require("../models/user_model");
const mailUtil = require('../util/mailutil');
var path = require('path')
var config = require('config')
const projectTypeModel = require("../models/project_type_model");
const {
	throws
} = require('assert');
const {
	error
} = require('console');
var logModel = require("../models/log_model");

const AWSLambda = require('../util/lambda.config');
const moment = require('moment')
const notificationModel = require("../models/notification_model");

exports.isActiveProjectType = async function (projectType) {
	logger.debug("[RFQ_service] :: projectType() : Start");
	let inactiveArray = []
	let found = projectType.toString().split(/[\s,]+/)
	for (var i = 0; i < found.length; i++) {
		const project = await projectTypeModel.getProjectTypeByStatus(found[i])
		if (empty(project)) {
			inactiveArray.push(found[i])
		}
	}
	logger.trace("[RFQ_service] :: projectType()  : End");
	return inactiveArray
}

exports.uploadRFQ = async function (files, lcData, rfqData) {
	const s3Client = s3.s3Client;
	const params = s3.uploadParams;
	if (files != 0) {
		for (var i = 0; i < files.length; i++) {
			const isValidLCFileId = await this.validateLCfiles(files[i].originalname, lcData);
			const isValidRFQFileId = await this.validateRFQfiles(files[i].originalname, rfqData);
			if (!empty(isValidLCFileId)) {
				params.Key = isValidLCFileId + '.pdf';
				params.Body = files[i].buffer;
				params.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketLC')
				params.ACL = config.get('S3Config.PublicACL')
				params.ContentType = config.get('S3Config.ContentType')
				await s3Client.upload(params, function (err, data) {
					if (err) {
						//console.log("Error", err.code)
						throw new Error(err.code);
					} else {
						console.log("Upload success", data)
					}
				})
			}
			if (!empty(isValidRFQFileId)) {
				params.Key = isValidRFQFileId + '.pdf';
				params.Body = files[i].buffer;
				params.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketRFQ')
				params.ACL = config.get('S3Config.PublicACL')
				params.ContentType = config.get('S3Config.ContentType')
				await s3Client.upload(params, function (err, data) {
					if (err) {
						//console.log("Error", err.code)
						throw new Error(err.code);
					} else {
						console.log("Upload success", data)
					}
				})
			}
		}
	}
}

exports.validateLCfiles = async function (fileName, lcData) {
	var isExists = ''
	let file = JSON.parse(lcData)
	for (var i = 0; i < file.length; i++) {
		if (String(file[i].fileName).replace(/\s/g, "").toLowerCase() == fileName.replace(/\s/g, "").toLowerCase()) {
			isExists = file[i].id
		}
	}
	return isExists;
}

exports.validateRFQfiles = async function (fileName, rfqData) {
	var isExists = ''
	let file = JSON.parse(rfqData)
	for (var i = 0; i < file.length; i++) {
		if (String(file[i].fileName).replace(/\s/g, "").toLowerCase() == fileName.replace(/\s/g, "").toLowerCase()) {
			isExists = file[i].id
		}
	}
	return isExists;
}

exports.insertRFQsData = async function (rfqData, status, userId) {
	logger.debug("[RFQ_service] :: insertRFQsData() : Start")
	let uploadedParams = []
	let uploadedPDF = []
	let uploadedRFQId = []
	let RFQsLog = false
	try {
		let rfqTitles = []
		let LCNames = []
		let updatedRFQs = []
		for (var i = 0; i < rfqData.length; i++) {
			let rfqD = JSON.parse(rfqData[i])
			var id = uuidv1()
			if (rfqD.interview !== undefined) {
				if (rfqD.interview.toLowerCase() == "n") {
					rfqD.interview = 0
				} else if (rfqD.interview.toLowerCase() == "y") {
					rfqD.interview = 1
				} else {
					rfqD.interview = 0
				}
			}
			//RFQ data
			const getRFQ = await rfqModel.getRFQByTitle(rfqD.title);
			if (!empty(getRFQ)) {
				let updatedRFQtitle = '';
				let replacedRFQId = '';
				let replacedRFQTitle = '';
				let isRFQUpdated = false;
				if (status == 'updateRFQ') {
					if (rfqD.description !== undefined || rfqD.submittalDate !== undefined || rfqD.interview !== undefined) {
						const data = await rfqModel.updateRFQByRFQId(getRFQ[0].Id, rfqD.description, rfqD.submittalDate, rfqD.interview);
						if (data[0] > 0 && rfqD.submittalDate !== undefined) {
							updatedRFQtitle = getRFQ[0].Title;
						}
					}
				} else if (status == 'replaceRFQ') { // Replace RFQ
					replacedRFQId = getRFQ[0].Id;
					replacedRFQTitle = getRFQ[0].Title;
					// Replace and Upadte RFQ once
					if (rfqD.description !== undefined || rfqD.submittalDate !== undefined || rfqD.interview !== undefined) {
						const data = await rfqModel.updateRFQByRFQId(getRFQ[0].Id, rfqD.description, rfqD.submittalDate, rfqD.interview);
						if (data[0] > 0 && rfqD.submittalDate !== undefined) {
							isRFQUpdated = true;
						}
					}
				}
				// insert letter
				const LCInsert = await this.insertLetterOfClarification(getRFQ[0].Id, rfqD.LC1, rfqD.LC2, rfqD.LC3, rfqD.LC4, userId)
				// send LC uploaded file ids

				// Determining the status of the LC(s) for an RFQ. Upload, update or both 
				let LCStatus = null;
				if (LCInsert.length > 0) {
					let LCReplaceStatus = LCInsert.map(e => e.replaceLC).
						filter((value, index, self) => self.indexOf(value) === index);
					if (LCReplaceStatus.length == 2) {
						LCStatus = 'replace_upload'
					} else {
						if (LCReplaceStatus[0] == true) {
							LCStatus = 'replace'
						} else {
							LCStatus = 'upload'
						}
					}
				}

				if (status == 'replaceRFQ') {
					let params = {
						id: replacedRFQId,
						fileName: rfqD.PDFName !== undefined ? rfqD.PDFName + '.pdf' : null,
						title: replacedRFQTitle,
						type: rfqD.PDFName !== undefined ? 'RFQ' : 'LC',
						files: LCInsert,
						lcStatus: LCStatus,
						isRFQReplaced: rfqD.PDFName !== undefined ? true : false,
						rfq: rfqD.PDFName === undefined ? replacedRFQTitle : null,
						updatedRFQ: isRFQUpdated ? replacedRFQTitle : ''
					}
					uploadedParams.push(params)
				} else {
					let params = {
						type: 'LC',
						files: LCInsert,
						rfq: getRFQ[0].Title,
						updatedRFQ: updatedRFQtitle,
						lcStatus: LCStatus,
						isRFQReplaced: false
					}
					uploadedParams.push(params)
				}
				// Extracting LC names for Adding logs
				LCInsert.forEach((lc) => {
					if (LCNames.indexOf(lc.fileName.split('.')[0]) === -1) {
						LCNames.push(lc.fileName.split('.')[0])
					}
				});
				if (updatedRFQtitle !== '' || replacedRFQTitle !== '') {
					updatedRFQs.push(getRFQ[0].Title) // List of updated RFQ titles
				}
			} else {
				//insert rfq
				if (status === "true") { // Add new RFQ(s)
					const rfq = await rfqModel.insertRFQData(id, rfqD.PDFName, rfqD.title, rfqD.submittalDate, rfqD.description, rfqD.interview);
				} else if (status === "none" || status == 'updateRFQ' || status == 'replaceRFQ') { //Upload LC, update LC, update RFQ or any combination of them + Add new RFQ(s)
					if (rfqD.PDFName !== undefined && rfqD.title !== undefined && rfqD.submittalDate !== undefined
						&& rfqD.description !== undefined && rfqD.interview !== undefined) {
						const rfq = await rfqModel.insertRFQData(id, rfqD.PDFName, rfqD.title, rfqD.submittalDate, rfqD.description, rfqD.interview);
					}
				}
				// insert letter
				const LCInsert = await this.insertLetterOfClarification(id, rfqD.LC1, rfqD.LC2, rfqD.LC3, rfqD.LC4, userId)
				//insert project type
				const projectTypeInsert = await this.insertRFQProjectType(id, rfqD.projectType)
				//uploade rfq ids
				let params = {
					id: id,
					fileName: rfqD.PDFName + '.pdf',
					title: rfqD.title,
					type: 'RFQ',
					files: LCInsert,
					isRFQReplaced: false
				}

				// Extracting LC names for Adding logs
				LCInsert.forEach((lc) => {
					if (LCNames.indexOf(lc.fileName.split('.')[0]) === -1) {
						LCNames.push(lc.fileName.split('.')[0])
					}
				});
				//insert upload ids
				uploadedParams.push(params)
				rfqTitles.push(rfqD.title);
				//uploadRFQId
				uploadedRFQId.push(id)
			}
		}
		if (rfqTitles.length > 0) { //Add RFQ Log
			await logModel.addLog("Admin", config.get('ResourceTypes.RFQ'), "RFQ(s) - " + rfqTitles.join(', ') + " added ", userId == null ? '' : userId, userId == null ? '' : userId)
		}
		if (updatedRFQs.length > 0) { // Update RFQ Log
			await logModel.addLog("Admin", config.get('ResourceTypes.RFQ'), "RFQ(s) - " + updatedRFQs.join(', ') + " updated ", userId == null ? '' : userId, userId == null ? '' : userId)
		}
		if (LCNames.length > 0) { // Add LC Log
			await logModel.addLog("Admin", config.get('ResourceTypes.LC'), "LC(s) - " + LCNames.join(', ') + " added", userId == null ? '' : userId, userId == null ? '' : userId)
		}
		return uploadedParams
	} catch (error) {
		const deleteRfq = await this.deleteRFQLCProjectType(uploadedRFQId)
		throw new Error(error);
	}
}

exports.insertRFQProjectType = async function (rfqId, projectTypeList) {
	logger.debug("[RFQ_service] :: insertRFQProjectType() : Start");
	let found = projectTypeList.toString().split(/[\s,]+/)
	for (var i = 0; i < found.length; i++) {
		const projectType = await projectTypeModel.getProjectTypeByNumber(found[i])
		if (!empty(projectType)) {
			const projectTypeInsert = await rfqModel.insertRFQProjectType(uuidv1(), rfqId, projectType[0].Id)
		}
	}
	logger.trace("[RFQ_service] :: insertRFQProjectType()  : End");
	return true
}

exports.insertLetterOfClarification = async function (rfqId, LC1, LC2, LC3, LC4, userId) {
	logger.debug("[RFQ_service] :: insertLetterOfClarification() : Start");
	let uploadedParams = []
	let uploadedRFQId = []
	let uploadedPDF = []
	let isRFQ = false
	let LCsLog = false

	if (LC1 == undefined && LC2 == undefined && LC3 == undefined && LC4 == undefined) {

	} else {
		if (LC1 != undefined) {
			const getLCByName = await rfqModel.getLCByName(rfqId, LC1)

			if (!empty(getLCByName)) {
				//RFQ has same LC associated with
				const LCObject = await rfqModel.getLCByLCName(LC1)
				let LCId = LCObject[0].Id
				let params = {
					id: LCId,
					fileName: LC1 + '.pdf',
					replaceLC: true
				}
				uploadedParams.push(params)
			} else {
				const LCObject = await rfqModel.getLCByLCName(LC1)
				let LCId;
				if (empty(LCObject)) {
					LCId = uuidv1()
				} else {
					LCId = LCObject[0].Id
				}
				let params = {
					id: LCId,
					fileName: LC1 + '.pdf',
					replaceLC: false
				}
				uploadedParams.push(params)
				if (empty(LCObject)) {
					const LCInsert = await rfqModel.insertLetterOfClarification(LCId, LC1)
				}
				const RFQLCInsert = await rfqModel.insertRFQLC(uuidv1(), rfqId, LCId)
				/*if (!LCsLog) {
					//await logModel.addLog("Admin", config.get('ResourceTypes.LC'), "LCs added", userId == null ? '' : userId)
					LCsLog = true
				}*/
			}
		}
		if (LC2 != undefined) {
			const getLCByName = await rfqModel.getLCByName(rfqId, LC2)
			if (!empty(getLCByName)) {
				//RFQ has same LC associated with
				const LCObject = await rfqModel.getLCByLCName(LC2)
				let LCId = LCObject[0].Id
				let params = {
					id: LCId,
					fileName: LC2 + '.pdf',
					replaceLC: true
				}
				uploadedParams.push(params)
			} else {
				//let LCId = uuidv1()
				const LCObject = await rfqModel.getLCByLCName(LC2)
				let LCId;
				if (empty(LCObject)) {
					LCId = uuidv1()
				} else {
					LCId = LCObject[0].Id
				}
				let params = {
					id: LCId,
					fileName: LC2 + '.pdf',
					replaceLC: false
				}
				uploadedParams.push(params)
				if (empty(LCObject)) {
					const LCInsert = await rfqModel.insertLetterOfClarification(LCId, LC2)
				}

				const RFQLCInsert = await rfqModel.insertRFQLC(uuidv1(), rfqId, LCId)
				/*if (!LCsLog) {
					//await logModel.addLog("Admin", config.get('ResourceTypes.LC'), "LCs added", userId == null ? '' : userId)
					LCsLog = true
				}*/
			}

		}
		if (LC3 != undefined) {
			const getLCByName = await rfqModel.getLCByName(rfqId, LC3)
			if (!empty(getLCByName)) {
				//RFQ has same LC associated with
				const LCObject = await rfqModel.getLCByLCName(LC3)
				let LCId = LCObject[0].Id
				let params = {
					id: LCId,
					fileName: LC3 + '.pdf',
					replaceLC: true
				}
				uploadedParams.push(params)
			} else {
				const LCObject = await rfqModel.getLCByLCName(LC3)
				//let LCId = uuidv1()
				let LCId;
				if (empty(LCObject)) {
					LCId = uuidv1()
				} else {
					LCId = LCObject[0].Id
				}
				let params = {
					id: LCId,
					fileName: LC3 + '.pdf',
					replaceLC: false
				}
				uploadedParams.push(params)
				if (empty(LCObject)) {
					const LCInsert = await rfqModel.insertLetterOfClarification(LCId, LC3)
				}

				const RFQLCInsert = await rfqModel.insertRFQLC(uuidv1(), rfqId, LCId)
				/*if (!LCsLog) {
					//await logModel.addLog("Admin", config.get('ResourceTypes.LC'), "LCs added", userId == null ? '' : userId)
					LCsLog = true
				}*/
			}
		}
		if (LC4 != undefined) {
			const getLCByName = await rfqModel.getLCByName(rfqId, LC4)
			if (!empty(getLCByName)) {
				//RFQ has same LC associated with
				const LCObject = await rfqModel.getLCByLCName(LC4)
				let LCId = LCObject[0].Id
				let params = {
					id: LCId,
					fileName: LC4 + '.pdf',
					replaceLC: true
				}
				uploadedParams.push(params)
			} else {
				const LCObject = await rfqModel.getLCByLCName(LC4)
				//let LCId = uuidv1()
				let LCId;
				if (empty(LCObject)) {
					LCId = uuidv1()
				} else {
					LCId = LCObject[0].Id
				}
				let params = {
					id: LCId,
					fileName: LC4 + '.pdf',
					replaceLC: false
				}
				uploadedParams.push(params)
				if (empty(LCObject)) {
					const LCInsert = await rfqModel.insertLetterOfClarification(LCId, LC4)
				}

				const RFQLCInsert = await rfqModel.insertRFQLC(uuidv1(), rfqId, LCId)
				/*if (!LCsLog) {
					//await logModel.addLog("Admin", config.get('ResourceTypes.LC'), "LCs added", userId == null ? '' : userId)
					LCsLog = true
				}*/
			}
		}
		uploadedRFQId.push(rfqId)
		// if (pdfName != undefined) {
		//     uploadedPDF.push(pdfName)
		// }
	}
	// // send mail to subcribers
	// if (uploadedPDF.length > 0) {
	//     const sendMail = await this.getAllSubscribeUser(uploadedPDF, isRFQ)
	// }
	logger.trace("[RFQ_service] :: insertLetterOfClarification()  : End");
	return uploadedParams
}

exports.deleteRFQ = async function (lcIdList, rfqIdList) {
	logger.debug("[RFQ_service] :: deleteRFQ() : Start")
	for (var i = 0; i < rfqIdList.length; i++) {
		const RFQDelete = await rfqModel.deleteRFQLCProjectType(rfqIdList[i].id)
	}
	for (var i = 0; i < lcIdList.length; i++) {
		const LCDelete = await rfqModel.deleteRFQLC(lcIdList[i].id)
	}
	logger.trace("[RFQ_service] :: deleteRFQ()  : End");
}

exports.deleteRFQLCProjectType = async function (rfqIdList) {
	logger.debug("[RFQ_service] :: deleteRFQLCProjectType() : Start" + rfqIdList)
	for (var i = 0; i < rfqIdList.length; i++) {
		const RFQDelete = await rfqModel.deleteRFQLCProjectType(rfqIdList[i])
	}
	logger.trace("[RFQ_service] :: deleteRFQLCProjectType()  : End");
}

exports.deleteRFQLC = async function (rfqIdList) {
	logger.debug("[RFQ_service] :: deleteRFQLC() : Start")
	for (var i = 0; i < rfqIdList.length; i++) {
		const LCDelete = await rfqModel.deleteRFQLC(rfqIdList[i])
	}
	logger.trace("[RFQ_service] :: deleteRFQLC()  : End");
}

exports.notifyUser = async function (lcIdList, rfqIdList, updatedRFQList) {
	logger.debug("[RFQ_service] :: notifyUser() : Start")
	let LCSet = []
	const user = await userModel.getAllSubscribeUser()
	let userList = []
	for (let i = 0; i < user.length; i++) {
		userList.push(user[i].Email)
	}
	let updatedRFQTitles = updatedRFQList.map(e => e.title); // Array of submittal updated RFQ titles
	var message = "<p>Dear City of Houston Portal user,</p>"
	message += "<p>There is a new RFQ related notification.</p>"
	if (rfqIdList.length > 0) {
		for (var i = 0; i < rfqIdList.length; i++) {
			if (!rfqIdList[i].isRFQReplaced) { //Newly added RFQ(s) 
				if (rfqIdList[i].hasLC) {
					message += "<ul><li>" + rfqIdList[i].title + " (New Clarification provided)" + "</li></ul>"
				} else {
					message += "<ul><li>" + rfqIdList[i].title + " (New RFQ)" + "</li></ul>"
				}
			} else { // Replaced RFQ(s)
				if (!updatedRFQTitles.includes(rfqIdList[i].title)) {
					if (rfqIdList[i].hasLC) {
						if (rfqIdList[i].lcStatus === 'upload') {
							message += "<ul><li>" + rfqIdList[i].title + " (RFQ Document Updated, New Clarification provided)" + "</li></ul>"
						} else if (rfqIdList[i].lcStatus === 'replace') {
							message += "<ul><li>" + rfqIdList[i].title + " (RFQ Document Updated, Letter of Clarification Updated)" + "</li></ul>"
						} else if (rfqIdList[i].lcStatus === 'replace_upload') {
							message += "<ul><li>" + rfqIdList[i].title + " (RFQ Document Updated, Letter(s) of Clarification Added and/or Updated)" + "</li></ul>"//
						}
					} else {
						message += "<ul><li>" + rfqIdList[i].title + " (RFQ Document Updated)" + "</li></ul>"
					}
				}
			}
		}
	}
	/**
	 * RFQs List of
	   1. Upload LC to existing RFQ
	   2. Update existing LC with newer version
	 */
	LCSet = lcIdList.filter(x => (x.existingRFQ !== undefined)).filter(x => (x.existingRFQ !== null)).map(v => ({ existingRFQ: v.existingRFQ, lcStatus: v.lcStatus })).
		filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i); // Unique RFQs list with clarification status

	for (let j = 0; j < LCSet.length; j++) {
		if (!updatedRFQTitles.includes(LCSet[j].existingRFQ)) {
			if (LCSet[j].lcStatus === 'upload') {
				message += "<ul><li>" + LCSet[j].existingRFQ + " (New Clarification Provided)" + "</li></ul>"
			} else if (LCSet[j].lcStatus === 'replace') {
				message += "<ul><li>" + LCSet[j].existingRFQ + " (Letter of Clarification Updated)" + "</li></ul>"
			} else if (LCSet[j].lcStatus === 'replace_upload') {
				message += "<ul><li>" + LCSet[j].existingRFQ + " (Letter(s) of Clarification Added and/or Updated)" + "</li></ul>" //
			}
		}
	}

	// Notification for Update RFQ submittal date
	if (updatedRFQList.length > 0) {
		for (let i = 0; i < updatedRFQList.length; i++) {
			if (!updatedRFQList[i].isRFQReplaced) { // Update RFQ(s)
				if (updatedRFQList[i].lcStatus == null) {
					message += "<ul><li>" + updatedRFQList[i].title + " (New Submittal Date)" + "</li></ul>"
				} else if (updatedRFQList[i].lcStatus == 'upload') {
					message += "<ul><li>" + updatedRFQList[i].title + " (New Submittal Date, New Clarification Provided)" + "</li></ul>"
				} else if (updatedRFQList[i].lcStatus == 'replace') {
					message += "<ul><li>" + updatedRFQList[i].title + " (New Submittal Date, Letter of Clarification Updated)" + "</li></ul>"//
				} else if (updatedRFQList[i].lcStatus == 'replace_upload') {
					message += "<ul><li>" + updatedRFQList[i].title + " (New Submittal Date, Letter(s) of Clarification Added and/or Updated)" + "</li></ul>"
				}
			} else { // Update + Replace RFQ(s)
				if (updatedRFQList[i].lcStatus == null) {
					message += "<ul><li>" + updatedRFQList[i].title + " (RFQ Document Updated, New Submittal Date)" + "</li></ul>"
				} else if (updatedRFQList[i].lcStatus == 'upload') {
					message += "<ul><li>" + updatedRFQList[i].title + " (RFQ Document Updated, New Submittal Date, New Clarification Provided)" + "</li></ul>"
				} else if (updatedRFQList[i].lcStatus == 'replace') {
					message += "<ul><li>" + updatedRFQList[i].title + " (RFQ Document Updated, New Submittal Date, Letter of Clarification Updated)" + "</li></ul>"
				} else if (updatedRFQList[i].lcStatus == 'replace_upload') {
					message += "<ul><li>" + updatedRFQList[i].title + " (RFQ Document Updated, New Submittal Date, Letter(s) of Clarification Added and/or Updated)" + "</li></ul>"//
				}
			}
		}
	}

	message += "<p> You may access the Vendor Portal using the following link: </p>" +
		"<a href='" + process.env.CLIENT_URL + "' target='_blank'>City of Houston Vendor Portal</a>" +
		"<p>Thank You,</p>" +
		"<p>City of Houston Vendor Portal</p>"

	await this.addNotifications(message)
	const res = this.sendEmailToUsers(message, userList)
	logger.trace("[RFQ_service] :: notifyUser()  : End");
	return res;
}

//send email individually for the subscribed users
exports.sendEmailToUsers = async function (message, userList) {
	logger.debug("[RFQ_service] :: sendEmailToUsers() : Start");
	let mailSent
	let itemsProcessed = 0;
	let isMailSendingCompleted = false
	try {
		//send emails individually
		await Promise.all(userList.map(async user => {
			itemsProcessed++;

			const mailOptions = {
				//from: "", // Sender address
				to: user,
				subject: "City of Houston Vendor Portal" + ' - RFQ Notification', // Subject line
				html: message + `<small>If you do not want to receive RFQ notifications, 
								 you can <a href=${process.env.CLIENT_URL}/unsubscribe?email=${user} target='_blank'>unsubscribe</a>.</small>`
				//+ `<small><a href=${process.env.CLIENT_URL}/unsubscribe?email=${user} target='_blank'>Unsubscribe</a></small>`
			};
			mailSent = await mailUtil.sendMail(mailOptions);
			logger.debug("[RFQ_service] :: sendEmailToUsers() : mailSent : {" + mailSent + " }");

			if (itemsProcessed === userList.length) {
				console.log('all done');
				isMailSendingCompleted = true
			}
		}));
		logger.trace("[RFQ_service] :: sendEmailToUsers()  : End");
		return isMailSendingCompleted
	} catch (err) {
		throw new Error(err);
	}
}

exports.addNotifications = async function (html) {
	logger.debug("[RFQ_service] :: addNotifications() : Start");
	const psVendorIds = await userModel.getPSVendors();
	for (let value of psVendorIds) {
		const notification = {
			id: uuidv1(),
			userId: value.Id,
			level: 3,
			subject: 'RFQ Notification',
			body: html.replace(/'/g, "''"),
			sentTime: moment().format('YYYY-MM-DD HH:mm:ss')
		};
		await notificationModel.addNotification(notification);
	}
	logger.trace("[RFQ_service] :: addNotifications()  : End");
}

exports.callback = function () {
	console.log('all done');
	return true;
}

exports.getRFQData = async function (noOfRfqs) {
	logger.debug("[RFQ_service] :: getRFQData() : Start");
	const rfq = await rfqModel.getRFQData(noOfRfqs);
	logger.trace("[RFQ_service] :: getRFQData()  : End");
	return rfq;
}

exports.getLettersOfClarification = async function (rfqId) {
	logger.debug("[RFQ_service] :: getLettersOfClarification() : Start");
	const lettersOfClarification = await rfqModel.getLettersOfClarification(rfqId);
	logger.trace("[RFQ_service] :: getLettersOfClarification()  : End");
	return lettersOfClarification;
}

exports.getRFQProjectType = async function (rfqId) {
	logger.debug("[RFQ_service] :: getRFQProjectType() : Start");
	const projectType = await rfqModel.getRFQProjectType(rfqId);
	logger.trace("[RFQ_service] :: getRFQProjectType()  : End");
	return projectType;
}

exports.getSearchResults = async function (params, noOfRfqs) {
	logger.debug("[RFQ_service] :: getSearchResults() : Start");
	const result = await rfqModel.getSearchResults(params, noOfRfqs);
	logger.trace("[RFQ_service] :: getSearchResults()  : End");
	return result;
}

// Get SOQ status for all the RFQs for a given vendor
exports.getSOQStatus = async function (vendorId) {
	logger.debug("[RFQ_service] :: getSOQStatus() : Start");
	const rfq = await rfqModel.getSOQStatus(vendorId);
	logger.trace("[RFQ_service] :: getSOQStatus()  : End");
	return rfq;
}

// Get RFQ details by RFQ Id
exports.getRFQDetailsByRFQId = async function (rfqId) {
	logger.debug("[RFQ_service] :: getRFQDetailsByRFQId() : Start");
	const rfq = await rfqModel.getRFQDetailsByRFQId(rfqId);
	logger.trace("[RFQ_service] :: getRFQDetailsByRFQId()  : End");
	return rfq;
}

// Get matching HPW100s for the RFQ
exports.getMatchingHPW100sByRFQ = async function (rfqId, vendorId) {
	logger.debug("[RFQ_service] :: getMatchingHPW100sByRFQ() : Start");
	const hpw100s = await rfqModel.getMatchingHPW100sByRFQ(rfqId, vendorId);
	logger.trace("[RFQ_service] :: getMatchingHPW100sByRFQ()  : End");
	if (hpw100s.length > 0) {
		return true
	} else {
		return false
	}
}

exports.getRFQByTitle = async function (title) {
	logger.debug("[RFQ_service] :: getRFQByTitle() : Start");
	const rfq = await rfqModel.getRFQByTitle(title);
	logger.trace("[RFQ_service] :: getRFQByTitle()  : End");
	return rfq;
}

exports.closeRFQ = async function () {
	logger.debug("[RFQ_service] :: closeRFQ() : Start");
	return new Promise((resolve, reject) => {
		const lambda = AWSLambda.lambda;
		const params = AWSLambda.params;
		lambda.invoke(params, function (err, data) {
			if (err) {
				console.log(err, err.stack)
				reject(err.stack);
			} else {
				resolve(data);
			}
		});
		logger.trace("[RFQ_service] :: closeRFQ()  : End");
	});
}

// Get No of active RFQs
exports.getNoOfActiveRFQs = async function () {
	logger.debug("[RFQ_service] :: getNoOfActiveRFQs() : Start");
	const data = await rfqModel.getNoOfActiveRFQs();
	logger.trace("[RFQ_service] :: getNoOfActiveRFQs()  : End");
	return data;
}

exports.getRFQsForExistingLCs = async function (lcList) {
	logger.debug("[RFQ_service] :: getRFQsForExistingLCs() : Start");
	let RFQLCData = []
	for (let i = 0; i < lcList.length; i++) {
		let params = {
			LCName: null,
			LCList: null
		}
		const RFQData = await rfqModel.getRFQsForExistingLC(lcList[i]);
		if (RFQData.length > 0) {
			params.LCName = lcList[i];
			params.LCList = RFQData;
			RFQLCData.push(params)
		}
	}

	logger.trace("[RFQ_service] :: getRFQsForExistingLCs()  : End");
	return RFQLCData;
}