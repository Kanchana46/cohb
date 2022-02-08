const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const constructionVendorService = require("../services/construction_vendor_service");
const fileDownloadUtil = require('../util/fileDownloadutil');
const basicUtil = require('../util/basicutil');

exports.getResourceDocuments = async function (req, res) {
	logger.debug("[construction_vendor_controller] :: getResourceDocuments() Start");
	try {
		var documents = await constructionVendorService.getResourceDocuments();
		logger.debug("[construction_vendor_controller] :: getResourceDocuments() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_Resource_Documents')
			},
			payload: documents
		});
	} catch (error) {
		logger.error("[construction_vendor_controller] :: getResourceDocuments() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_Resource_Documents')
			},
			payload: null
		});
	}
}


exports.getCSVendorInfo = async function (req, res) {
	logger.debug("[construction_vendor_controller] :: getCSVendorInfo() Start");
	try {
		var info = await constructionVendorService.getCSVendorInfo(req.params.userId);
		logger.debug("[construction_vendor_controller] :: getCSVendorInfo() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_CSVendor_Info')
			},
			payload: info
		});
	} catch (error) {
		logger.error("[construction_vendor_controller] :: getCSVendorInfo() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_CSVendor_Info')
			},
			payload: null
		});
	}
}

exports.checkCertificationNoAvailability = async function (req, res, next) {
	logger.debug("[construction_vendor_controller] :: checkCertificationNoAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var Id = req.params.id;
		var certificationNoExists = await constructionVendorService.checkCertificationNoAvailability(inputValue, Id);
		logger.debug("[construction_vendor_controller] :: checkCertificationNoAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: certificationNoExists
		});
	} catch (error) {
		logger.error("[construction_vendor_controller] :: checkCertificationNoAvailability() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Validating_Input')
			},
			payload: null
		});
	}
};

exports.saveVendorProfileData = async function (req, res) {
	logger.debug("[construction_vendor_controller] :: saveVendorProfileData() Start");
	try {
		var vendor = await constructionVendorService.saveVendorProfileData(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[construction_vendor_controller] :: saveVendorProfileData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Saved_Vendor_data')
			},
			payload: vendor
		});
	} catch (error) {
		logger.error("[construction_vendor_controller] :: saveVendorProfileData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Saving__Vendor_data')
			},
			payload: null
		});
	}
}

exports.saveAccountManagerData = async function (req, res) {
	logger.debug("[construction_vendor_controller] :: saveAccountManagerData() Start");
	try {
		var result = await constructionVendorService.saveAccountManagerData(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[construction_vendor_controller] :: saveAccountManagerData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Saved_Account_Manager_data')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[construction_vendor_controller] :: saveAccountManagerData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Saving_Account_Manager_data')
			},
			payload: null
		});
	}
}

exports.getCSVendorInfoAndCPDoc = async function (req, res) {
	logger.debug("[construction_vendor_controller] :: getCSVendorInfoAndCPDoc() Start");
	try {
		var info = await constructionVendorService.getCSVendorInfoAndCPDoc(req.params.userId, req.params.cpId);
		logger.debug("[construction_vendor_controller] :: getCSVendorInfoAndCPDoc() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_CSVendor_Info')
			},
			payload: info
		});
	} catch (error) {
		logger.error("[construction_vendor_controller] :: getCSVendorInfoAndCPDoc() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_CSVendor_Info')
			},
			payload: null
		});
	}
}