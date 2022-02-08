var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('config')
const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const HPW100Service = require("../services/HPW100_service");
const fileDownloadUtil = require('../util/fileDownloadutil');
const basicUtil = require('../util/basicutil');

exports.addHPW100 = async function (req, res, next) {
	logger.debug("[HPW100_controller] :: addHPW100() Start");
	try {
		var hpw100 = await HPW100Service.addHPW100(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[HPW100_controller] :: addHPW100() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Saved_HPW100')
			},
			payload: hpw100
		});
	} catch (error) {
		logger.error("[HPW100_controller] :: addHPW100() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Adding_HPW100')
			},
			payload: null
		});

	}
};

exports.getHPW100ByVendorId = async function (req, res, next) {
	logger.debug("[HPW100_controller] :: getHPW100ByVendorId() Start");
	try {
		var hpw100List = await HPW100Service.getHPW100ByVendorId(req.params.vendorId);
		logger.debug("[HPW100_controller] :: getHPW100ByVendorId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_HPW100s')
			},
			payload: hpw100List
		});
	} catch (error) {
		logger.error("[HPW100_controller] :: getHPW100ByVendorId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_HPW100s')
			},
			payload: null
		});

	}
};

exports.getWorkExperiencesByHPW100Id = async function (req, res, next) {
	logger.debug("[HPW100_controller] :: getWorkExperiencesByHPW100Id() Start");
	try {
		var hpw100List = await HPW100Service.getWorkExperiencesByHPW100Id(req.params.hpw100Id);
		logger.debug("[HPW100_controller] :: getWorkExperiencesByHPW100Id() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Work_Experiences')
			},
			payload: hpw100List
		});
	} catch (error) {
		logger.error("[HPW100_controller] :: getWorkExperiencesByHPW100Id() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Work_Experiences')
			},
			payload: null
		});

	}
};

exports.updateHPW100 = async function (req, res, next) {
	logger.debug("[HPW100_controller] :: updateHPW100() Start");
	try {
		var hpw100List = await HPW100Service.updateHPW100(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[HPW100_controller] :: updateHPW100() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_HPW100')
			},
			payload: hpw100List
		});
	} catch (error) {
		logger.error("[HPW100_controller] :: updateHPW100() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_HPW100')
			},
			payload: null
		});

	}
};

exports.getCompanyTypes = async function (req, res, next) {
	logger.debug("[HPW100_controller] :: getCompanyTypes() Start");
	try {
		var hpw100List = await HPW100Service.getCompanyTypes();
		logger.debug("[HPW100_controller] :: getCompanyTypes() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_CompanyTypes')
			},
			payload: hpw100List
		});
	} catch (error) {
		logger.error("[HPW100_controller] :: getCompanyTypes() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Company_Types')
			},
			payload: null
		});

	}
};


exports.getProjectTypesByVendorHPWs = async function (req, res, next) {
	logger.debug("[HPW100_controller] :: getProjectTypesByVendorHPWs() Start");
	try {
		var hpw100List = await HPW100Service.getProjectTypesByVendorHPWs(req.params.vendorId);
		logger.debug("[HPW100_controller] :: getProjectTypesByVendorHPWs() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Project_Type')
			},
			payload: hpw100List
		});
	} catch (error) {
		logger.error("[HPW100_controller] :: getProjectTypesByVendorHPWs() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Project_Types')
			},
			payload: null
		});

	}
};

exports.downloadHpw100 = async function (req, res) {
	logger.debug("[HPW100_controller] :: downloadHpw100() Start");
	try {
		var result = await fileDownloadUtil.downloadFile(req.body)
		logger.debug("[HPW100_controller] :: downloadHpw100() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_HPW100s')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[HPW100_controller] :: downloadHpw100() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_HPW100s')
			},
			payload: null
		});
	}
}