const logger = require('../util/log4jsutil');
const soqModel = require("../models/SOQ_model");
const psVendorModel = require("../models/professional_vendor_model");
const rfqModel = require("../models/RFQ_model")
const hpw100Model = require("../models/HPW100_model");
const uuidv1 = require('uuid/v1');
const s3 = require('../util/s3.config');
const AWS = require('aws-sdk')
var config = require('config')
var empty = require('is-empty');
var libxmljs = require("libxmljs");
var fs = require('fs');
var date = require('date-and-time');
var path = require('path')
var generatePDF = require('../util/generate_pdf')
var constants = require('../util/const.js')
const util = require('../util/basicutil')
const logModel = require('../models/log_model')
const fileDownload = require('../util/fileDownloadutil');
const moment = require('moment');

// Get SOQ data by RFQ
exports.getSOQByRFQId = async function (rfq) {
	logger.debug("[SOQ_service] :: getSOQByRFQId() : Start");
	const soq = await soqModel.getSOQByRFQId(rfq.Id);
	logger.trace("[SOQ_service] :: getSOQByRFQId()  : End");
	return soq;
}

// Get SOQ data by RFQ and vendor
exports.getSOQByRFQAndVendor = async function (rfqId, vendorId) {
	logger.debug("[SOQ_service] :: getSOQByRFQAndVendor() : Start");
	var result = [];
	try {
		const soq = await soqModel.getSOQByRFQAndVendor(rfqId, vendorId);
		if (soq.length) {
			//decode HTML entities
			soq[0].Question1 = util.decodeHTML(soq[0].Question1)
			soq[0].Question2 = util.decodeHTML(soq[0].Question2)
			soq[0].Question3 = util.decodeHTML(soq[0].Question3)
			soq[0].Question4 = util.decodeHTML(soq[0].Question4)
			soq[0].Question5 = util.decodeHTML(soq[0].Question5)
			soq[0].Question6 = util.decodeHTML(soq[0].Question6)
			result.push({
				soqDetails: soq
			}); //add soq details to the output
			var soqId = soq[0].Id;
			if (soqId) {
				const HPW100s = await soqModel.getSOQHPW100sBySOQId(soqId); //get selected hpw100s
				result.push({
					selectedHPW100s: HPW100s
				}); //add selected hpw100s to the output

				const subVendors = await soqModel.getSOQSubVendorsBySOQId(soqId); //get selected sub vendors
				result.push({
					selectedSubVendors: subVendors
				}); //add selected sub vendors to the output
			}
		}

		logger.trace("[SOQ_service] :: getSOQByRFQAndVendor()  : End");
		return result;
	} catch (err) {
		throw new Error(err);
	}
}

// Get HPW100s by vendor
exports.getHPW100sByVendorId = async function (vendorId) {
	logger.debug("[SOQ_service] :: getHPW100sByVendorId() : Start");
	const hpw100s = await soqModel.getHPW100sByVendorId(vendorId);
	logger.trace("[SOQ_service] :: getHPW100sByVendorId()  : End");
	return hpw100s;
}

// Get professional service sub vendors
exports.getPSSubVendors = async function (vendorId) {
	logger.debug("[SOQ_service] :: getPSSubVendors() : Start");
	const psvendors = await soqModel.getPSSubVendors(vendorId);
	logger.trace("[SOQ_service] :: getPSSubVendors()  : End");
	return psvendors;
}

// Save SOQ details
exports.saveSOQDetails = async function (soqM, userId) {
	logger.debug("[SOQ_service] :: saveSOQDetails() : Start");
	var soqId = "";
	try {
		//get the existing SOQ
		const extSOQ = await soqModel.getSOQByRFQAndVendor(soqM.rfqId, soqM.vendorId);
		//if the SOQ is exist then call the updateSOQ() 
		//otherwise call the addSOQ()
		if (extSOQ.length) {
			soqId = extSOQ[0].Id;
			soqM.soqId = soqId
			await soqModel.updateSOQ(soqId, soqM); //update SOQ with new details
			//delete existing HPW100_SOQ and add new records
			await soqModel.deleteHPW100SOQ(soqId);
			soqM.hpw100Selected.forEach(async element => {
				var soqHPWId = uuidv1();
				await soqModel.addHPW100SOQ(soqHPWId, element.hpw100Id, soqId);
			});

			//delete existing SOQ_Subvendor and add new records
			await soqModel.deleteSOQSubVendor(soqId);
			soqM.subvendorSelected.forEach(async element => {
				var soqSubVendorId = uuidv1();
				await soqModel.addSOQSubvendor(soqSubVendorId, soqId, element.subVendorUserId);
			});
		} else {
			//generate unique id for the SOQ
			var id = uuidv1();
			soqM.soqId = id
			const soqa = await soqModel.addSOQ(id, soqM);
			if (soqa.length) {
				soqId = soqa[0].Id
				soqM.hpw100Selected.forEach(async element => {
					var soqHPWId = uuidv1();
					await soqModel.addHPW100SOQ(soqHPWId, element.hpw100Id, soqId);
				});

				soqM.subvendorSelected.forEach(async element => {
					var soqSubVendorId = uuidv1();
					await soqModel.addSOQSubvendor(soqSubVendorId, soqId, element.subVendorUserId);
				});
			}
		}

		let section = "";
		if (soqM.selectedSection == 'hpw100SubVendors') {
			section = "HPW100s & Sub vendors";
		} else if (soqM.selectedSection == 'questions') {
			section = "SOQ Questions";
		}
		await logModel.addLog("ps vendor", config.get('ResourceTypes.SOQ'), ` ${section} of SOQ updated `, soqM.vendorId, userId);
		logger.trace("[SOQ_service] :: saveSOQDetails()  : End");
		return soqId;
	} catch (err) {
		throw new Error(err);
	}
}

// Upload SOQ document into the S3 bucket
exports.uploadSOQ = async function (file, soqId, fileName) {
	logger.debug("[SOQ_service] :: uploadSOQ() : Start");
	const s3Client = s3.s3Client;
	const params = s3.uploadParams;
	if (file != 0) {
		params.Key = soqId + '.pdf';
		params.Body = file.buffer;
		params.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketSOQ')
		params.ACL = config.get('S3Config.AuthenticatedACL')
		params.ContentType = config.get('S3Config.ContentType')
	}
	const soq = await s3Client.upload(params, function (err, data) {
		if (err) {
			const deleteSOQ = soqModel.deleteSOQ(soqId); //delete SOQ
			throw new Error(err.code);
		} else {
			console.log("Upload success", data)
		}
	}).promise()
	if (soq) {
		await soqModel.updateSOQFileName(soqId, fileName);
	}
	logger.trace("[SOQ_service] :: uploadSOQ()  : End");
	return soq
}

// Save SOQ details and set HPW100 status to Submitted
exports.submitSOQ = async function (soqM, userId) {
	logger.debug("[SOQ_service] :: submitSOQ() : Start");
	var hpw100Ids = []
	var soqId
	try {
		var soq = await this.saveSOQDetails(soqM, userId) // save SOQ details
		soqId = soq
		const hpw100SubmittedStatus = await hpw100Model.getHPW100SubmittedStatusId() // get HPW100 status id
		logger.debug("hpw100SubmittedStatus=", hpw100SubmittedStatus)
		await Promise.all(soqM.hpw100Selected.map(async (element) => {
			var hpw100ExistingStatus = await hpw100Model.getHPW100StatusByHPW100Id(element.hpw100Id)
			logger.debug("hpw100ExistingStatus=", hpw100ExistingStatus)
			if (hpw100ExistingStatus[0].StatusId != hpw100SubmittedStatus[0].Id) {
				hpw100Ids.push("'" + element.hpw100Id + "'")
				await hpw100Model.addHPW100Profile(soqM.vendorId, element.hpw100Id);
				await hpw100Model.addHPW100FullTimePersonnel(soqM.vendorId, element.hpw100Id);
				await hpw100Model.addHPW100Office(soqM.vendorId, element.hpw100Id);
				await hpw100Model.addHPW100ServiceFee(soqM.vendorId, element.hpw100Id);
				await hpw100Model.setHPW100Status(element.hpw100Id, hpw100SubmittedStatus[0].Id); // set HPW100 status to Submitted
				await hpw100Model.setSubmitTime(element.hpw100Id, moment().format('YYYY-MM-DD HH:mm:ss'));
				await this.generateHPW100PDF(element.hpw100Id)
				var projectType = await hpw100Model.getHPW100ProjectTypeByHPW100Id(element.hpw100Id)
				if (projectType.length > 0) {
					await logModel.addLog("ps vendor", config.get('ResourceTypes.HPW100'), "HPW 100 submitted for " + projectType[0].Type, soqM.vendorId, userId);
				}
			}
		}))
		await this.generateSOQPDF(soqM)
		var rfqInfo = await rfqModel.getAllRFQDetailsByRFQId(soqM.rfqId)
		if (rfqInfo.length > 0) {
			await logModel.addLog("ps vendor", config.get('ResourceTypes.SOQ'), "SOQ submitted for " + rfqInfo[0].Title, soqM.vendorId, userId)
		}
		logger.trace("[SOQ_service] :: submitSOQ()  : End");
		return soq
	} catch (err) {
		if (hpw100Ids.length) {
			hpw100Ids.join(',')
			// in case of error, undo profile to HPW 100 copy and revert status to Pending
			const deleteHPW100Profiles = await hpw100Model.deleteHPW100ProfileDetails(hpw100Ids); //delete HPW100 profile details
			const HPW100s = await hpw100Model.setHPW100StatusToPending(hpw100Ids); // set HPW100 status to pending 
		}
		const SOQ = await soqModel.updateSOQStatus(soqId, 'Pending'); // set soq status to pending  
		throw new Error(err);
	}
}

exports.generateHPW100PDF = async function (hpw100Id) {
	logger.debug("[SOQ_service] :: generateHPW100PDF : Start");
	var doc = libxmljs.Document();
	var soq = doc.node("hpw100")
	soq.node("curDate", date.format(new Date(), "MM/DD/YYYY"));

	var projectType = await hpw100Model.getHPW100ProjectTypeByHPW100Id(hpw100Id)
	if (projectType.length > 0) {
		soq.node("projectType", projectType[0].Type);
	}

	hpw100Profile = await hpw100Model.getHPW100VendorProfileByHPW100Id(hpw100Id)
	if (hpw100Profile.length > 0) {
		var establishedInHouston = ''
		if (hpw100Profile[0].YearEstablished) {
			if (new Date(hpw100Profile[0].YearEstablished).getUTCFullYear() == 1900 && new Date(hpw100Profile[0].YearEstablished).getUTCMonth() == 0 && new Date(hpw100Profile[0].YearEstablished).getUTCDate() == 1) {
				establishedInHouston = ''
			} else {
				establishedInHouston = new Date(new Date(hpw100Profile[0].YearEstablished).getUTCFullYear(), new Date(hpw100Profile[0].YearEstablished).getUTCMonth(), new Date(hpw100Profile[0].YearEstablished).getUTCDate())
			}
		}
		soq.node("vendor", hpw100Profile[0].Vendor);
		soq.node("companyEmail", hpw100Profile[0].CompanyEmail);
		soq.node("companyPhone", hpw100Profile[0].CompanyPhone);
		soq.node("accountManagerName", hpw100Profile[0].ACManagerName);
		soq.node("accountManagerPhone", hpw100Profile[0].ACManagerPhone);
		soq.node("accountManagerEmail", hpw100Profile[0].ACManagerEmail);
		soq.node("taxId", hpw100Profile[0].TaxId);
		soq.node("dba", hpw100Profile[0].DBA);
		soq.node("businessPhone", hpw100Profile[0].Phone);
		soq.node("vendorNo", hpw100Profile[0].VendorNo);
		soq.node("businessAddress", hpw100Profile[0].BusinessAddress + ", " + hpw100Profile[0].BusinessAddrCity + ", " + hpw100Profile[0].BusinessAddrState + " " + hpw100Profile[0].BusinessAddrZipcode);
		soq.node("mailingAddress", hpw100Profile[0].MailingAddress + ", " + hpw100Profile[0].MailingAddrCity + ", " + hpw100Profile[0].MailingAddrState + " " + hpw100Profile[0].MailingAddrZipcode);
		soq.node("website", hpw100Profile[0].Website == "null" ? 'N/A' : hpw100Profile[0].Website);
		soq.node("houstonOfficePresent", hpw100Profile[0].HoustonOffice == '' ? 'No' : 'Yes');
		soq.node("houstonOffice", hpw100Profile[0].HoustonOffice);
		soq.node("establishedInHouston", establishedInHouston == '' ? '' : date.format(establishedInHouston, "MM/DD/YYYY"));
		soq.node("companyParent", hpw100Profile[0].ParentCompany);
		soq.node("totalHouston", hpw100Profile[0].TotalPersonnel == null ? '' : hpw100Profile[0].TotalPersonnel.toString());
		soq.node("totalPersoneelFirm", hpw100Profile[0].FirmTotalPersonnel == null ? 'N/A' : hpw100Profile[0].FirmTotalPersonnel.toString());
		soq.node("cityCertified", hpw100Profile[0].IsCertified == 0 ? 'No' : 'Yes');
		soq.node("cityCertNo", hpw100Profile[0].CertificateNo == '' ? 'N/A' : hpw100Profile[0].CertificateNo);
		soq.node("firmCertNo", hpw100Profile[0].TxBoardOfProf);
		soq.node("principalContactName", hpw100Profile[0].PrincipalName);
		soq.node("principalContactTitle", hpw100Profile[0].PrincipalTitle);
		soq.node("principalContactEmail", hpw100Profile[0].PrincipalEmail);
		soq.node("principalContactPhone", hpw100Profile[0].PrincipalPhone);
		var additionalPersonnel = soq.node("additionalPersonnel")
		additionalPersonnel.node("disciplineTitle1", hpw100Profile[0].DisciplineTitle1 == "null" ? '' : hpw100Profile[0].DisciplineTitle1);
		additionalPersonnel.node("disciplineCount1", hpw100Profile[0].DisciplineCount1 == null ? '' : hpw100Profile[0].DisciplineCount1.toString());
		additionalPersonnel.node("disciplineTitle2", hpw100Profile[0].DisciplineTitle2 == "null" ? '' : hpw100Profile[0].DisciplineTitle2);
		additionalPersonnel.node("disciplineCount2", hpw100Profile[0].DisciplineCount2 == null ? '' : hpw100Profile[0].DisciplineCount2.toString());
		additionalPersonnel.node("disciplineTitle3", hpw100Profile[0].DisciplineTitle3 == "null" ? '' : hpw100Profile[0].DisciplineTitle3);
		additionalPersonnel.node("disciplineCount3", hpw100Profile[0].DisciplineCount3 == null ? '' : hpw100Profile[0].DisciplineCount3.toString());
		additionalPersonnel.node("disciplineTitle4", hpw100Profile[0].DisciplineTitle4 == "null" ? '' : hpw100Profile[0].DisciplineTitle4);
		additionalPersonnel.node("disciplineCount4", hpw100Profile[0].DisciplineCount4 == null ? '' : hpw100Profile[0].DisciplineCount4.toString());
	}
	hpw100Office = await hpw100Model.getHPW100OfficeByHPW100Id(hpw100Id)
	if (hpw100Office.length > 0) {
		var offices = soq.node("presentOffices")

		hpw100Office.forEach(element => {
			office = offices.node("office")
			office.node("city", element.City)
			office.node("state", element.StateDesc)
			office.node("phone", element.Phone)
			office.node("personnelByOffice", element.OfficePersonnel)
		})
	}
	hpw100ServiceFee = await hpw100Model.getHPW100ServiceFeeByHPW100Id(hpw100Id)
	if (hpw100ServiceFee.length > 0) {
		var serviceFees = soq.node("serviceFees")
		hpw100ServiceFee.forEach(element => {
			var serviceFee = serviceFees.node("serviceFee")
			serviceFee.node("year", element.Year.toString());
			serviceFee.node("contract", element.ContractWork);
			serviceFee.node("total", element.TotalFees);
			serviceFee.node("contractFirm", element.FirmTotalFees);
		})
	}
	hpw100FullTimePersonnel = await hpw100Model.getHPW100FullTimePersonnelByHPW100Id(hpw100Id)
	if (hpw100FullTimePersonnel.length > 0) {
		var fullTimePersonnels = soq.node("fullTimePersonnels")
		hpw100FullTimePersonnel.forEach(element => {
			if (element.Count > 0) {
				var fullTimePersonnel = fullTimePersonnels.node("fullTimePersonnel")
				fullTimePersonnel.node("title", element.Title);
				fullTimePersonnel.node("count", element.Count.toString());
			}
		})
	}
	hpw100WorkExperiences = await hpw100Model.getWorkExperiencesByHPW100Id(hpw100Id)
	if (hpw100WorkExperiences.length > 0) {
		var workExperiences = soq.node("workExperiences")
		hpw100WorkExperiences.forEach(element => {
			var workExperience = workExperiences.node("workExperience")
			let startDate = moment(element.StartDate).format('MM/DD/YYYY');
			let completionDate = moment(element.CompletionDate).format('MM/DD/YYYY');
			workExperience.node("projectName", element.ProjectName)
			workExperience.node("location", element.LocationDesc)
			workExperience.node("companyType", element.CompanyTypeDesc)
			workExperience.node("startDate", element.StartDate == null ? '' : startDate)
			workExperience.node("completionDate", completionDate == '01/01/1900' ? 'N/A' : completionDate)
			workExperience.node("cost", element.Cost.toString())
			workExperience.node("responsibilityNature", element.ResponsibilityNature)
			workExperience.node("projectOwner", element.ProjectOwner)
			workExperience.node("ownerAddress", element.OwnerAddress + ", " + element.OwnerCity + ", " + element.OwnerState + " " + element.OwnerZipcode)
			workExperience.node("contactPerson", element.ContactPerson == '' ? 'N/A' : element.ContactPerson)
			workExperience.node("contactPersonPhone", element.ContactPersonPhone)
		})
	}

	/*const uploadParams = {
		Bucket: process.env.S3_BUCKETNAME + config.get('S3Config.BucketHPW100'),
		Key: hpw100Id + '.pdf',
		Body: null,
		ACL: config.get('S3Config.AuthenticatedACL'),
		ContentType: config.get('S3Config.ContentType')
	};*/

	//generate the pdf using the xml
	await generatePDF.generate(doc.toString(), 'hpw100', hpw100Id).then(function () { }).catch(function (err) {
		throw new Error(err)
	})
	logger.debug("[SOQ_service] :: generateHPW100PDF : End");
}

exports.generateSOQPDF = async function (soqM) {
	logger.debug("[SOQ_service] :: generateSOQPDF() : Start");

	let rfqInfo = null;
	let userInfo = null;
	let subVendors = null;
	await psVendorModel.getUserInfoByVendorId(soqM.vendorId).then(async (data) => {
		userInfo = data
	});
	await rfqModel.getAllRFQDetailsByRFQId(soqM.rfqId).then(async (data) => {
		rfqInfo = data
	});
	await soqModel.getSOQSubVendorsBySOQId(soqM.soqId).then(async (data) => {
		subVendors = data
	});

	let company, email, phone, taxId, subVendorList = ''

	if (userInfo.length > 0) {
		company = userInfo[0].Company
		email = userInfo[0].Email
		phone = userInfo[0].Phone
		taxId = userInfo[0].TaxId
	}

	if (subVendors.length > 0) {
		subVendors.forEach(element => {
			if (!empty(subVendorList)) {
				subVendorList = subVendorList + ', '
			}
			subVendorList = subVendorList + element.Vendor
		})
	}

	let rfqTitle, rfqDesc, rfqProjectTypes, submittalDate = ''
	if (rfqInfo.length > 0) {
		rfqTitle = rfqInfo[0].Title
		rfqDesc = rfqInfo[0].Description
		rfqProjectTypes = rfqInfo[0].ProjectTypes
		var temp = new Date(new Date(rfqInfo[0].SubmittalDate).getUTCFullYear(), new Date(rfqInfo[0].SubmittalDate).getUTCMonth(), new Date(rfqInfo[0].SubmittalDate).getUTCDate())
		submittalDate = date.format(temp, "MM/DD/YYYY")
	}

	soqM.question1 = util.replaceNoEndHTMLTag(soqM.question1);
	soqM.question2 = util.replaceNoEndHTMLTag(soqM.question2);
	soqM.question3 = util.replaceNoEndHTMLTag(soqM.question3);
	soqM.question4 = util.replaceNoEndHTMLTag(soqM.question4);
	soqM.question5 = util.replaceNoEndHTMLTag(soqM.question5);
	soqM.question6 = util.replaceNoEndHTMLTag(soqM.question6);

	var doc = libxmljs.Document();
	var soq = doc.node("soq")
	soq.node('imagesDir', path.join(__dirname, '../util/xsl/images').split("\\").join("/"));

	var vendor = soq.node("vendor")
	vendor.node("company", company)
	vendor.node("email", email)
	vendor.node("phone", phone)
	vendor.node("taxId", taxId)
	vendor.node("subVendors", subVendorList)

	var rfq = soq.node("rfq")
	rfq.node("title", rfqTitle)
	rfq.node("description", rfqDesc)
	rfq.node("projectTypes", rfqProjectTypes)
	rfq.node("submittalDate", submittalDate)

	try {
		var answers = soq.node("questions")

		var answer1content = libxmljs.parseXmlString("<question><questionNo>1</questionNo><text>" + constants.question1 + "</text><description>" + constants.question1Desc + "</description><answer>" + util.replaceNbsps(soqM.question1.trim()) + "</answer></question>", {
			noblanks: true
		});

		answers.addChild(answer1content.root())

		var answer2content = libxmljs.parseXmlString("<question><questionNo>2</questionNo><text>" + constants.question2 + "</text><description>" + constants.question2Desc + "</description><answer>" + util.replaceNbsps(soqM.question2.trim()) + "</answer></question>", {
			noblanks: true
		});
		answers.addChild(answer2content.root())

		var answer3content = libxmljs.parseXmlString("<question><questionNo>3</questionNo><text>" + constants.question3 + "</text><description>" + constants.question3Desc + "</description><answer>" + util.replaceNbsps(soqM.question3.trim()) + "</answer></question>", {
			noblanks: true
		});

		answers.addChild(answer3content.root())

		var answer4content = libxmljs.parseXmlString("<question><questionNo>4</questionNo><text>" + constants.question4 + "</text><description>" + constants.question4Desc + "</description><answer>" + util.replaceNbsps(soqM.question4.trim()) + "</answer></question>", {
			noblanks: true
		});
		answers.addChild(answer4content.root())

		var answer5content = libxmljs.parseXmlString("<question><questionNo>5</questionNo><text>" + constants.question5 + "</text><description>" + constants.question5Desc + "</description><answer>" + util.replaceNbsps(soqM.question5.trim()) + "</answer></question>", {
			noblanks: true
		});
		answers.addChild(answer5content.root())

		var answer6content = libxmljs.parseXmlString("<question><questionNo>6</questionNo><text>" + constants.question6 + "</text><description>" + constants.question6Desc + "</description><answer>" + util.replaceNbsps(soqM.question6.trim()) + "</answer></question>", {
			noblanks: true
		});
		answers.addChild(answer6content.root())
	} catch (err) {
		throw new Error('invalid_data')
	}

	var docId = uuidv1()
	/*const uploadParams = s3.uploadParams;
	
	uploadParams.Key = docId + '.pdf';
	uploadParams.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketSOQ')
	uploadParams.ACL = config.get('S3Config.AuthenticatedACL')
	uploadParams.ContentType = config.get('S3Config.ContentType')*/
	//add the entry to soq_generated_pdf
	await soqModel.addSOQGeneratedPDF(docId, soqM.soqId)
	await generatePDF.generate(doc.toString(), 'soq', docId).
		then(async function (data) {
			if (data.Key.indexOf(docId) == -1) {
				await soqModel.deleteGeneratedSOQ(docId);
				throw new Error("reupload")
			}
		}).
		catch(async function (err) {
			await soqModel.deleteGeneratedSOQ(docId);
			throw new Error(err)
		});
	logger.debug("[SOQ_service] :: generateSOQPDF() : End");
}

// Get SOQ generated document Id by SOQ Id
exports.getGeneratedSOQDocIdBySOQId = async function (soqId) {
	logger.debug("[SOQ_service] :: getGeneratedSOQDocIdBySOQId() : Start");
	const soqGeneratedDoc = await soqModel.getGeneratedSOQDocIdBySOQId(soqId);
	logger.trace("[SOQ_service] :: getGeneratedSOQDocIdBySOQId()  : End");
	return soqGeneratedDoc;
}

exports.getSubmissionData = async function (vendorId, soqId) {
	logger.debug("[SOQ_service] :: getSubmissionData() : Start");
	const data = await soqModel.getSubmissionData(vendorId, soqId);
	logger.trace("[SOQ_service] :: getSubmissionData()  : End");
	return data;
}

exports.downloadAll = async function (soqData, callback) {
	logger.debug("[SOQ_service] :: downloadAll() : Start");
	await fileDownload.downloadZip(soqData, (data) => {
		callback(data)
	}, 'Vendor');
	logger.trace("[SOQ_service] :: downloadAll()  : End");

}

// Get All Submission data for RFQ
exports.getAllSubmissionData = async function (params) {
	logger.debug("[SOQ_service] :: getAllSubmissionData() : Start");
	let soqData = [];
	for (let i = 0; i < params.length; i++) {
		const data = await soqModel.getSubmissionData(params[i].vendorId, params[i].soqId);
		soqData.push(data[0]);
	}
	logger.trace("[SOQ_service] :: getAllSubmissionData()  : End");
	return soqData;
}

// Download All Submissions for RFQ
/*exports.downloadAllSubmissions = async function (soqData, downloadOption) {
	logger.debug("[SOQ_service] :: downloadAllSubmissions() : Start");
	console.log(soqData)
	return new Promise(async (resolve, reject) => {
		let submissionData = [];
		console.log('SOQ_data_length : ' + soqData.length)
		for (let i = 0; i < soqData.length; i++) {
			await fileDownload.downloadZip(soqData[i], (data) => {
				if (data.code == 'NoSuchKey') {
					resolve(data);
				} else {
					submissionData.push(data)
					if (submissionData.length == soqData.length) {
						resolve(submissionData);
						console.log('resolved')
						//logModel.addLog("Admin", config.get('ResourceTypes.SOQ'), `SOQ Submissions for RFQ - ${soqData[0].rfqTitle} was downloaded`, userId, userId);
					}
				}
			}, downloadOption);
		}
		logger.trace("[SOQ_service] :: downloadAllSubmissions()  : End");
	});
}*/

/*exports.addDownloadAllSubmissionsLog = async function (rfqTitle, userId) {
	logger.debug("[SOQ_service] :: addDownloadAllSubmissionsLog() : Start");
	const data = logModel.addLog("Admin", config.get('ResourceTypes.SOQ'), `SOQ Submissions for RFQ - ${rfqTitle} was downloaded`, userId, userId);
	logger.trace("[SOQ_service] :: addDownloadAllSubmissionsLog()  : End");
	return data;
}*/

/** 
* CR #17
* Download All submissions for RFQ using SOQZipService
*/
exports.downloadAllSubmissions = async function (rfq, downloadOption, userId) {
	logger.debug("[SOQ_service] :: downloadAllSubmissions() : Start");
	const rfq_data = await soqModel.getZippedRFQByRFQId(rfq.Id);
	let url = "";
	if (rfq_data.length == 0) {
		throw new Error('NotZipped');
	} else {
		url = await fileDownload.downloadSOQZip(rfq, downloadOption);
		await logModel.addLog("Admin", config.get('ResourceTypes.SOQ'), `SOQ Submissions for RFQ - ${rfq.title} was downloaded`, userId, userId);
	}
	logger.trace("[SOQ_service] :: downloadAllSubmissions()  : End");
	return url;
}
