var config = require('config')
const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const resourceService = require("../services/resource_service")
const basicUtil = require('../util/basicutil');

exports.docUpload = async function (req, res) {
	logger.debug("[resource_controller] :: docUpload() Start");
	try {
		var rfqs = await resourceService.uploadResourceDoc(req.files, req.body.resource, req.body.vendorType);
		logger.debug("[resource_controller] :: doUpload()() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_upload_resource_document')
			},
			payload: rfqs
		});
	} catch (error) {
		logger.error("[resource_controller] ::doUpload()() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_uploading_resource_document')
			},
			payload: null
		});
	}
}

exports.insertResourceDoc = async function (req, res) {
	logger.debug("[resource_controller] :: insertResourceDoc() Start");
	try {
		const reqFileData = req.body;
		var addDoc = await resourceService.addResourceDoc(reqFileData.vendorType, reqFileData.files, reqFileData.title, basicUtil.getTokenUserId(req));
		logger.debug("[resource_controller] :: insertResourceDoc()() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_adding_resource_document')
			},
			payload: addDoc
		});
	} catch (error) {
		return res.status(400).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_adding_resource_document')
			},
			payload: null
		});

	}
}

exports.deleteResourceDocs = async function (req, res) {
	logger.debug("[resource_controller] :: deleteResourceDoc() Start");
	try {
		var resource = await resourceService.deleteResourceDocs(req.body.resource, req.body.vendorType);
		logger.debug("[resource_controller] :: deleteResourceDoc() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Removed_RFQ')
			},
			payload: resource
		});
	} catch (error) {
		logger.error("[resource_controller] ::deleteResourceDoc() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Removed_RFQ')
			},
			payload: null
		});
	}
}

exports.deleteResourceDoc = async function (req, res) {
	logger.debug("[resource_controller] :: deleteResourceDocument() Start");
	try {
		var resource = await resourceService.deleteResourceDoc(req.body.Id, req.body.vendorType, basicUtil.getTokenUserId(req));
		logger.debug("[resource_controller] :: deleteResourceDocument() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Deleted_Resource_Document')
			},
			payload: resource
		});
	} catch (error) {
		logger.error("[resource_controller] ::deleteResourceDocument() : error : " + error);
		if (error.number == 547) {
			// statement conflicts with the FOREIGN KEY/REFERENCE constraints
			return res.status(error.number).json({
				status: {
					code: error.number,
					name: i18n.__('Error'),
					message: i18n.__('Error_Deleting_Resource_Document')
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Deleting_Resource_Document')
				},
				payload: null
			});
		}
	}
}