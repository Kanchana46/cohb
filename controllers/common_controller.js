const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const commonService = require("../services/common_service");
const config = require("config")

exports.getServerVersion = async function (req, res) {
	logger.debug("[common_controller] :: getServerVersion() Start");
	try {
		var serverVersion = await commonService.getServerVersion();
		logger.debug("[common_controller] :: getServerVersion() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Server_Version')
			},
			payload: serverVersion
		});
	} catch (error) {
		logger.error("[common_controller] :: getServerVersion() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Server_Version')
			},
			payload: null
		});
	}
}

exports.getResourceTypes = async function (req, res) {
	logger.debug("[common_controller] :: getResourceTypes() Start");
	try {
		var resourceTypes = config.get('ResourceTypes');
		logger.debug("[common_controller] :: getResourceTypes() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Resource_Types')
			},
			payload: resourceTypes
		});
	} catch (error) {
		logger.error("[common_controller] :: getResourceTypes() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Resource_Types')
			},
			payload: null
		});
	}
}

exports.getMaintenanceData = async function(req, res) {
	logger.debug("[common_controller] :: getMaintenanceData() Start");
	try {
		var data = await commonService.getMaintenanceData();
		logger.debug("[common_controller] :: getMaintenanceData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Maintenance_Data')
			},
			payload: data
		});
	} catch (error) {
		logger.error("[common_controller] :: getMaintenanceData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Maintenance_Data')
			},
			payload: null
		});
	}
}