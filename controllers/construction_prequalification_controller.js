const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const cpService = require("../services/construction_prequalification_service");
const basicUtil = require('../util/basicutil');
const fileDownloadUtil = require('../util/fileDownloadutil');

exports.getCPVendors = async function (req, res) {
	logger.debug("[CP_controller] :: getCPVendors() Start" + req.params.status);
	try {
		var cp = await cpService.getCPVendors(req.params.status, req.params.noOfCPs);
		logger.debug("[CP_controller] :: getCPVendors() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_CP')
			},
			payload: cp
		});
	} catch (error) {
		logger.error("CP_controller] :: getCPVendors() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_CP')
			},
			payload: null
		});
	}
}

exports.updateCPstatus = async function (req, res) {
	logger.debug("[CP_controller] :: updateCPstatus() Start" + req.body);
	try {
		var cp = await cpService.updateCPstatus(req.body.status, req.body.cpId, req.body.userId, req.body.comment, basicUtil.getTokenUserId(req));
		logger.debug("[CP_controller] :: updateCPstatus() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_CP_Status')
			},
			payload: cp
		});
	} catch (error) {
		logger.error("CP_controller] :: updateCPstatus() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_CP_status')
			},
			payload: null
		});
	}
}

exports.getCpDataByCategoryAndCPId = async function (req, res) {
	logger.debug("[CP_controller] :: getCpDataByCategoryAndCPId() Start" + req.body);
	try {
		var cpdoc = await cpService.getCpDataByCategoryAndCPId(req.body);
		logger.debug("[CP_controller] :: getCpDataByCategoryAndCPId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_CP_Data')
			},
			payload: cpdoc
		});
	} catch (error) {
		logger.error("CP_controller] :: getCpDataByCategoryAndCPId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_CP_Data')
			},
			payload: null
		});
	}
}

exports.updateCPDocumentData = async function (req, res) {
	logger.debug("[CP_controller] :: updateCPDocumentData() Start");
	try {
		var cpdoc = await cpService.updateCPDocumentData(req.body, req.files, basicUtil.getTokenUserId(req));
		logger.debug("[CP_controller] :: updateCPDocumentData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_CP_Data')
			},
			payload: cpdoc
		});
	} catch (error) {
		logger.error("CP_controller] :: updateCPDocumentData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_CP_Data')
			},
			payload: null
		});
	}
}

exports.getCPDataByVendorId = async function (req, res) {
	logger.debug("[CP_controller] :: getCPdataByVendorId() Start" + req.body);
	try {
		var cpData = await cpService.getCPDataByVendorId(req.body);
		logger.debug("[CP_controller] :: getCPdataByVendorId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_CP_Data')
			},
			payload: cpData
		});
	} catch (error) {
		logger.error("CP_controller] :: getCPdataByVendorId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_CP_Data')
			},
			payload: null
		});
	}
}

exports.getCPDocAndCategory = async function (req, res) {
	logger.debug("[CP_controller] :: getCPDocAndCategory() Start" + req.body);
	try {
		var cpData = await cpService.getCPDocAndCategory();
		logger.debug("[CP_controller] :: getCPDocAndCategory() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_CP_Doc')
			},
			payload: cpData
		});
	} catch (error) {
		logger.error("CP_controller] :: getCPDocAndCategory() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_CP_Doc')
			},
			payload: null
		});
	}
}

exports.updateConstructionPrequalification = async function (req, res) {
	logger.debug("[CP_controller] :: updateConstructionPrequalification() Start" + req.body);
	try {
		console.log(req.body)
		var result = await cpService.updateConstructionPrequalification(req.body);
		logger.debug("[CP_controller] :: updateConstructionPrequalification() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_CP')
			},
			payload: result
		});
	} catch (error) {
		logger.error("CP_controller] :: updateConstructionPrequalification() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_CP')
			},
			payload: null
		});
	}
}

exports.setCPStatus = async function (req, res) {
	logger.debug("[CP_controller] :: setCPStatus() Start");
	try {
		var result = await cpService.setCPStatus(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[CP_controller] :: setCPStatus() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_CP_Status')
			},
			payload: result
		});
	} catch (error) {
		logger.error("CP_controller] :: setCPStatus() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_CP_status')
			},
			payload: null
		});
	}
}

exports.getSearchResults = async function (req, res) {
	logger.debug("[CP_controller] :: getSearchResults() Start");
	try {
		var result = await cpService.getSearchResults(req.body, req.params.noOfCPs, req.params.status);
		logger.debug("[CP_controller] :: getSearchResults() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[CP_controller] :: getSearchResults() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Search_Results')
			},
			payload: null
		});
	}
}

//Add new construction prequalification
exports.addConstructionPrequalification = async function (req, res) {
	logger.debug("[CP_controller] :: addConstructionPrequalification() Start");
	try {
		var result = await cpService.addConstructionPrequalification(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[CP_controller] :: addConstructionPrequalification() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Added_Construction_Prequalification')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[CP_controller] :: addConstructionPrequalification() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Adding_Construction_Prequalification')
			},
			payload: null
		});
	}
}

exports.downloadCPFiles = async function (req, res) {
	console.log(req.body)
	logger.debug("[RFQ_controller] :: download() Start");
	try {
		var result = await fileDownloadUtil.downloadFile(req.body)
		logger.debug("[RFQ_controller] :: download() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Downloaded')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: download() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Downloading')
			},
			payload: null
		});
	}
}

// Save checklist
exports.saveCheckListData = async function (req, res) {
	logger.debug("[RFQ_controller] :: saveCheckListData() Start");
	try {
		var result = await cpService.saveCheckListData(req.body, basicUtil.getTokenUserId(req))
		logger.debug("[RFQ_controller] :: saveCheckListData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Saved_Checklist_Data')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: saveCheckListData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Saving_Checklist_Data')
			},
			payload: null
		});
	}
}

// Get checklist data by cp Id
exports.getCheckListByCPId = async function (req, res) {
	logger.debug("[RFQ_controller] :: getCheckListByCPId() Start");
	try {
		var result = await cpService.getCheckListByCPId(req.body.cpId)
		logger.debug("[RFQ_controller] :: getCheckListByCPId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Checklist_Data')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getCheckListByCPId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Checklist_Data')
			},
			payload: null
		});
	}
}

