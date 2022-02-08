var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('config')
const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const professionalVendorService = require("../services/professional_vendor_service");
const fileDownloadUtil = require('../util/fileDownloadutil');
const basicUtil = require('../util/basicutil');

// Update professional vendor profile by user id.
exports.updatePSVendorByVendorId = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: updatePSVendorByVendorId() Start");
	try {
		var vendorProfileUpdated = await professionalVendorService.updatePSVendorByVendorId(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[professional_vendor_controller] :: updatePSVendorByVendorId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_Professional_Vendor_Profile')
			},
			payload: vendorProfileUpdated
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: updatePSVendorByVendorId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_Professional_Vendor_Profile')
			},
			payload: null
		});
	}
};

// Check tax id availability.
exports.checkTaxIdAvailability = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: checkTaxIdAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var id = req.params.id;
		var taxIdExists = await professionalVendorService.checkTaxIdAvailability(inputValue, id);
		logger.debug("[professional_vendor_controller] :: checkTaxIdAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: taxIdExists
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: checkTaxIdAvailability() : error : " + error);
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

// Check certificate no availability.
exports.checkCertificationNoAvailability = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: checkCertificationNoAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var id = req.params.id;
		var certificationNoExists = await professionalVendorService.checkCertificationNoAvailability(inputValue, id);
		logger.debug("[professional_vendor_controller] :: checkCertificationNoAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: certificationNoExists
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: checkCertificationNoAvailability() : error : " + error);
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

// Check tx board of prof availability.
exports.checkTxBoardOfProfAvailability = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: checkTxBoardOfProfAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var id = req.params.id;
		var txBoardOfProfExists = await professionalVendorService.checkTxBoardOfProfAvailability(inputValue, id);
		logger.debug("[professional_vendor_controller] :: checkTxBoardOfProfAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: txBoardOfProfExists
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: checkTxBoardOfProfAvailability() : error : " + error);
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

// Get professional vendor profile data
exports.getPSVendorByUserId = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: getPSVendorByUserId() Start");
	try {
		var vendorData = await professionalVendorService.getPSVendorByUserId(req.params.userId);
		logger.debug("[professional_vendor_controller] :: getPSVendorByUserId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Fetched_PSVendor_Data_By_User')
			},
			payload: vendorData
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: getPSVendorByUserId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Fetching_PSVendor_Data_By_User')
			},
			payload: null
		});
	}
};

// Get states list.
exports.getAllStates = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: getAllStates() Start");
	try {
		var states = await professionalVendorService.getAllStates();
		logger.debug("[professional_vendor_controller] :: getAllStates() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_States')
			},
			payload: states
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: getAllStates() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_States')
			},
			payload: null
		});
	}
};

// Get FullTimePersonnel list.
exports.getFullTimePersonnel = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: getFullTimePersonnel() Start");
	try {
		var states = await professionalVendorService.getFullTimePersonnel();
		logger.debug("[professional_vendor_controller] :: getFullTimePersonnel() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_States')
			},
			payload: states
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: getFullTimePersonnel() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_States')
			},
			payload: null
		});
	}
};

// Get professional vendor profile status
exports.getPSVendorProfileStatusByUserId = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: getPSVendorProfileStatusByUserId() Start");
	try {
		var profileStatus = await professionalVendorService.getPSVendorProfileStatusByUserId(req.params.userId);
		logger.debug("[professional_vendor_controller] :: getPSVendorProfileStatusByUserId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Fetched_PSVendor_Profile_Status_By_User')
			},
			payload: profileStatus
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: getPSVendorProfileStatusByUserId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Fetching_PSVendor_Profile_Status_By_User')
			},
			payload: null
		});
	}
};

exports.getResourceDocuments = async function (req, res) {
	logger.debug("[professional_vendor_controller] :: getResourceDocuments() Start");
	try {
		var documents = await professionalVendorService.getResourceDocuments();
		logger.debug("[professional_vendor_controller] :: getResourceDocuments() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_Resource_Documents')
			},
			payload: documents
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: getResourceDocuments() : error : " + error);
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

//get ps vendor info and connected hpw100
exports.getPSVendorANDHPW100ByUserId = async function (req, res, next) {
	logger.debug("[professional_vendor_controller] :: getPSVendorANDHPW100ByUserId() Start");
	try {
		var profileStatus = await professionalVendorService.getPSVendorANDHPW100ByUserId(req.params.userId);
		logger.debug("[professional_vendor_controller] :: getPSVendorANDHPW100ByUserId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Fetched_PSVendor_Profile_Status_By_User')
			},
			payload: profileStatus
		});
	} catch (error) {
		logger.error("[professional_vendor_controller] :: getPSVendorANDHPW100ByUserId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Fetching_PSVendor_Profile_Status_By_User')
			},
			payload: null
		});
	}
};
