const db = require("../db/dbconnection");
const uuidv1 = require('uuid/v1');
var empty = require('is-empty');
var config = require('config')
const logger = require('../util/log4jsutil');
const hpw100Model = require("../models/HPW100_model");
const logModel = require('../models/log_model')

exports.addHPW100 = async function (hpw100, userId) {
	logger.debug("[HPW100_service] :: addHPW100() : Start");
	const status = await hpw100Model.getHPW100StatusByStatusId("Pending");
	if (status.length == 0) {
		logger.debug("[HPW100_service] :: addHPW100() : End");
		throw new Error('HPW100_Status_Not_Avaialable');
	} else {
		hpw100.statusId = status[0].Id
		hpw100.id = uuidv1()
		let hasWorkExp = (hpw100.workExperience.length !== 0) ? true : false;
		var hpw100Saved = await hpw100Model.addHPW100(hpw100)
		await hpw100Model.deleteWorkExperienceByHPW100Id(hpw100.id)
		try {
			const hpw100WorkExpSaved = await hpw100Model.addWorkExperience(hpw100)
		} catch (error) {
			await hpw100Model.deleteHPW100(hpw100.id)
			throw new error(error)
		}
		var projectType = await hpw100Model.getHPW100ProjectTypeByHPW100Id(hpw100.id)
		if (projectType.length > 0) {
			let activity = "";
			if (hasWorkExp) {
				activity = `Work Experience of HPW100 of ${projectType[0].Type} added`;
			} else {
				activity = `HPW 100 of ${projectType[0].Type} added`;
			}
			await logModel.addLog("ps vendor", config.get('ResourceTypes.HPW100'),
				activity, hpw100.vendorId, userId)
		}
		logger.debug("[HPW100_service] :: addHPW100() : End");
		return hpw100;
	}
}

exports.updateHPW100 = async function (hpw100, userId) {
	logger.debug("[HPW100_service] :: updateWorkExperiences() : Start");
	let hasWorkExp = (hpw100.workExperience.length !== 0) ? true : false;
	await hpw100Model.deleteWorkExperienceByHPW100Id(hpw100.id)
	const hpw100WorkExpSaved = await hpw100Model.addWorkExperience(hpw100)
	hpw100.workExperience = hpw100WorkExpSaved
	await hpw100Model.updateHPW100ExpiryStatus(hpw100.id);
	var projectType = await hpw100Model.getHPW100ProjectTypeByHPW100Id(hpw100.id)
	if (projectType.length > 0) {
		let activity = "";
		if (hasWorkExp) {
			activity = `Work Experience of HPW100 of ${projectType[0].Type} updated`;
		} else {
			activity = `HPW 100 of ${projectType[0].Type} updated`;
		}
		await logModel.addLog("ps vendor", config.get('ResourceTypes.HPW100'),
			activity, hpw100.vendorId, userId)
	}

	logger.debug("[HPW100_service] :: updateWorkExperiences() : End");
	return hpw100
}

exports.getHPW100ByVendorId = async function (vendorId) {
	logger.debug("[HPW100_service] :: getHPW100ByVendorId() : Start");
	var hpw100List = await hpw100Model.getHPW100ByVendorId(vendorId)
	logger.debug("[HPW100_service] :: getHPW100ByVendorId() : End");
	return hpw100List;
}

exports.getWorkExperiencesByHPW100Id = async function (vendorId) {
	logger.debug("[HPW100_service] :: getWorkExperiencesByHPW100Id() : Start");
	var hpw100List = await hpw100Model.getWorkExperiencesByHPW100Id(vendorId)
	logger.debug("[HPW100_service] :: getWorkExperiencesByHPW100Id() : End");
	return hpw100List;
}

exports.getCompanyTypes = async function () {
	logger.debug("[HPW100_service] :: getCompanyTypes() : Start");
	var hpw100List = await hpw100Model.getCompanyTypes()
	logger.debug("[HPW100_service] :: getCompanyTypes() : End");
	return hpw100List;
}

exports.getProjectTypesByVendorHPWs = async function (vendorId) {
	logger.debug("[HPW100_service] :: getProjectTypesByVendorHPWs() : Start");
	var hpw100List = await hpw100Model.getProjectTypesByVendorHPWs(vendorId)
	logger.debug("[HPW100_service] :: getProjectTypesByVendorHPWs() : End");
	return hpw100List;
}