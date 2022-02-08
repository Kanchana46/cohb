var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('config')
const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const projectTypeService = require("../services/project_type_service");
const basicUtil = require('../util/basicutil');

exports.saveProjectType = async function (req, res, next) {
	logger.debug("[project_type_controller] :: saveProjectType() Start");
	try {
		var userId = basicUtil.getTokenUserId(req)
		var projectTypeSaved = await projectTypeService.saveProjectType(req.body, userId);
		logger.debug("[project_type_controller] :: saveProjectType() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Saved_Project_Type')
			},
			payload: projectTypeSaved
		});
	} catch (error) {
		logger.error("[project_type_controller] :: saveProjectType() : error : " + error);
		if (error.message === 'projectTypeNotAvailable') {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Saving_Project_Type_Exists')
				},
				payload: {
					'projectTypeAvailable': 0
				}
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Saving_Project_Type')
				},
				payload: null
			});
		}
	}
};

exports.getAllProjectTypes = async function (req, res, next) {
	logger.debug("[project_type_controller] :: getAllProjectTypes() Start");
	try {
		var allProjectTypes = await projectTypeService.getAllProjectTypes();
		logger.debug("[project_type_controller] :: getAllProjectTypes() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Project_Types')
			},
			payload: allProjectTypes
		});
	} catch (error) {
		logger.error("[project_type_controller] :: getAllProjectTypes() : error : " + error);
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

exports.updateProjectTypeStatusById = async function (req, res, next) {
	logger.debug("[project_type_controller] :: updateProjectTypeStatusById() Start");
	try {
		var userId = basicUtil.getTokenUserId(req)
		var projectTypeStatusChanged = await projectTypeService.updateProjectTypeStatusById(req.body, userId);
		logger.debug("[project_type_controller] :: updateProjectTypeStatusById() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Changed_Project_Type_Status')
			},
			payload: projectTypeStatusChanged
		});
	} catch (error) {
		logger.error("[project_type_controller] :: updateProjectTypeStatusById() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Changing_Project_Type_Status')
			},
			payload: null
		});
	}
};

exports.updateProjectTypeById = async function (req, res, next) {
	logger.debug("[project_type_controller] :: updateProjectTypeById() Start");
	try {
		var projectTypeUpdated = await projectTypeService.updateProjectTypeById(req.body);
		logger.debug("[project_type_controller] :: updateProjectTypeById() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_Project_Type')
			},
			payload: projectTypeUpdated
		});
	} catch (error) {
		logger.error("[project_type_controller] :: updateProjectTypeById() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_Project_Type')
			},
			payload: null
		});
	}
};

exports.checkProjectTypeAvailability = async function (req, res, next) {
	logger.debug("[project_type_controller] :: checkProjectTypeAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var typeExists = await projectTypeService.checkProjectTypeAvailability(inputValue);
		logger.debug("[project_type_controller] :: checkProjectTypeAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: typeExists
		});
	} catch (error) {
		logger.error("[project_type_controller] :: checkProjectTypeAvailability() : error : " + error);
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

exports.getProjectTypesByStatus = async function (req, res, next) {
	logger.debug("[project_type_controller] :: getActiveProjectTypes() Start");
	try {

		var status = req.params.status;
		var activeProjectTypes = await projectTypeService.getProjectTypesByStatus(status);
		logger.debug("[project_type_controller] :: getActiveProjectTypes() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Project_Types')
			},
			payload: activeProjectTypes
		});
	} catch (error) {
		logger.error("[project_type_controller] :: getActiveProjectTypes() : error : " + error);
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