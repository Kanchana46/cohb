const logger = require('../util/log4jsutil');
const constructionVendorModel = require("../models/construction_vendor_model");
const cpModel = require("../models/construction_prequalification_model");
const moment = require('moment')
const logModel = require('../models/log_model');
const isEmpty = require('is-empty');
var config = require('config')

exports.getResourceDocuments = async function () {
	logger.debug("[construction_vendor_service] :: getResourceDocuments() : Start");
	const documents = await constructionVendorModel.getResourceDocuments();
	logger.trace("[construction_vendor_service] :: getResourceDocuments()  : End");
	return documents;
}

exports.getCSVendorInfo = async function (userId) {
	logger.debug("[construction_vendor_service] :: getCSVendorInfo() : Start");
	const vendorInfo = await constructionVendorModel.getCSVendorInfo(userId);
	tempDate = moment(vendorInfo[0].YearEstablished).utc();
	vendorInfo[0].YearEstablished = {
		year: parseInt(tempDate.format('YYYY')),
		month: parseInt(tempDate.format('MM')),
		day: parseInt(tempDate.format('DD'))
	};
	logger.trace("[construction_vendor_service] :: getCSVendorInfo()  : End");
	return vendorInfo;
}

exports.checkCertificationNoAvailability = async function (inputValue, Id) {
	logger.debug("[construction_vendor_service] :: checkCertificationNoAvailability() : Start");
	const certificationNoAvailable = await constructionVendorModel.checkCertificationNoAvailability(inputValue, Id);
	logger.trace("[construction_vendor_service] :: checkCertificationNoAvailability()  : End");
	return certificationNoAvailable;
}

exports.saveVendorProfileData = async function (vendor, userId) {
	logger.debug("[construction_vendor_service] :: saveVendorProfileData() : Start");
	if (vendor.year !== null) {
		vendor.year.month = vendor.year.month - 1;
		convertedEstablishedDate = moment(vendor.year);
		vendor.year = convertedEstablishedDate.format('YYYY-MM-DD HH:mm:ss')
		/*tempDate = moment(vendor.year);
		convertedEstablishedDate = tempDate.subtract(1, 'months');
		vendor.year = convertedEstablishedDate.format('YYYY-MM-DD HH:mm:ss');*/
	} else if (vendor.year === 'Invalid date') {
		vendor.year = null;
	}
	if (vendor.website === '') {
		vendor.website = null;
	}
	const vendorProfile = await constructionVendorModel.saveVendorProfileData(vendor);
	var csVendor = await constructionVendorModel.getCSVendorIdByUserId(vendor.id)
	if (csVendor.length > 0) {
		await logModel.addLog("cs vendor", config.get('ResourceTypes.Profile'), "Company Information of Profile updated", csVendor[0].Id, userId)
	}
	logger.trace("[construction_vendor_service] :: saveVendorProfileData()  : End");
	return vendorProfile;
}

exports.saveAccountManagerData = async function (accManager, userId) {
	logger.debug("[construction_vendor_service] :: saveAccountManagerData() : Start");
	const result = await constructionVendorModel.saveAccountManagerData(accManager);
	var csVendor = await constructionVendorModel.getCSVendorIdByUserId(accManager.id)
	if (csVendor.length > 0) {
		await logModel.addLog("cs vendor", config.get('ResourceTypes.Profile'), "Account Manager Information of Profile updated", csVendor[0].Id, userId)
	}
	logger.trace("[construction_vendor_service] :: saveAccountManagerData()  : End");
	return result;
}

exports.getCSVendorInfoAndCPDoc = async function (userId, cpId) {
	logger.debug("[construction_vendor_service] :: getCSVendorInfoAndCPDoc() : Start");
	const vendorInfo = await constructionVendorModel.getCSVendorInfo(userId);
	//get documents if the construction prequalification is available
	if (cpId != 'undefined') {
		const getCPDocInfo = await cpModel.getCpDocByCPId(cpId)
		let params = {
			docDetails: getCPDocInfo
		}
		vendorInfo.push(params)
	}

	if (!isEmpty(vendorInfo)) {
		tempDate = moment(vendorInfo[0].YearEstablished);
		vendorInfo[0].YearEstablished = {
			year: tempDate.format('YYYY'),
			month: tempDate.format('MM'),
			day: tempDate.format('DD')
		};
	}
	logger.trace("[construction_vendor_service] :: getCSVendorInfoAndCPDoc()  : End");
	return vendorInfo;
}