const db = require("../db/dbconnection");
const uuidv1 = require('uuid/v1');
var bcrypt = require('bcryptjs');
var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var config = require('config')
const logger = require('../util/log4jsutil');
const projectTypeModel = require("../models/project_type_model");
const logModel = require('../models/log_model')

exports.saveProjectType = async function (projectType, userId) {
	logger.debug("[project_type_service] :: saveProjectType() : Start");
	const projectTypeAvailablity = await this.checkProjectTypeAvailability(projectType.type)
	if (projectTypeAvailablity[0].projectTypeAvailable == 1) {
		const projectTypeSaved = await projectTypeModel.saveProjectType(projectType)
		await logModel.addLog("Admin", config.get('ResourceTypes.ProjectType'), "Project Type - " + projectType.type + " added", userId == null ? '' : userId, userId == null ? '' : userId)
		logger.trace("[project_type_service] :: saveProjectType()  : End");
		return projectTypeSaved;
	}
	else if (projectTypeAvailablity[0].projectTypeAvailable == 0) {

		throw new Error('projectTypeNotAvailable');
	} else {

		throw new Error('projectNotsaved');
	}

}

exports.getAllProjectTypes = async function () {
	logger.debug("[project_type_service] :: getAllProjectTypes() : Start");
	const allProjectTypes = await projectTypeModel.getAllProjectTypes()
	logger.trace("[project_type_service] :: getAllProjectTypes()  : End");
	return allProjectTypes;
}

exports.updateProjectTypeStatusById = async function (projectType, userId) {
	logger.debug("[project_type_service] :: updateProjectTypeStatusById() :" + projectType.id);
	const projectTypeStatusChnage = await projectTypeModel.updateProjectTypeStatusById(projectType.id, projectType.status);
	await logModel.addLog("Admin", config.get('ResourceTypes.ProjectType'), "Project Type - " + projectType.type + " updated to " + (projectType.status == 1 ? 'active' : 'inactive'),
		userId == null ? '' : userId, userId == null ? '' : userId)
	logger.trace("[project_type_service] :: updateProjectTypeStatusById()  : End");
	return projectTypeStatusChnage;
}

exports.updateProjectTypeById = async function (projectType) {
	logger.debug("[project_type_service] :: updateProjectTypeById() :" + projectType.id);
	const projectTypeUpdated = await projectTypeModel.updateProjectTypeById(projectType.id, projectType.type);
	logger.trace("[project_type_service] :: updateProjectTypeById()  : End");
	return projectTypeUpdated;
}

exports.checkProjectTypeAvailability = async function (inputValue) {
	logger.debug("[project_type_service] :: checkProjectTypeAvailability() : Start");
	const typeAvailable = await projectTypeModel.checkProjectTypeAvailability(inputValue)
	logger.trace("[project_type_service] :: checkProjectTypeAvailability()  : End");

	console.log(typeAvailable);
	return typeAvailable;
};

exports.getProjectTypesByStatus = async function (status) {
	logger.debug("[project_type_service] :: getProjectTypesByStatus() : Start");
	const allProjectTypes = await projectTypeModel.getProjectTypesByStatus(status)
	logger.trace("[project_type_service] :: getProjectTypesByStatus()  : End");
	return allProjectTypes;
}