var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('config')
const i18n = require("i18n");
const rfqService = require('../services/RFQ_service');
const logger = require('../util/log4jsutil');
const fileDownloadUtil = require('../util/fileDownloadutil');
const basicUtil = require('../util/basicutil');

exports.docUpload = async function (req, res) {
	logger.debug("[RFQ_controller] :: docUpload() Start");
	try {
		//var rfqDetails = await rfqService.insertRFQsData(req.body.rfq);
		var rfqs = await rfqService.uploadRFQ(req.files, req.body.lc, req.body.rfq);
		logger.debug("[RFQ_controller] :: docUpload()() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Upload_RFQ')
			},
			payload: rfqs
		});
	} catch (error) {
		logger.error("[RFQ_controller] ::docUpload()() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Uploading_RFQ')
			},
			payload: null
		});
	}
}

exports.insertRFQ = async function (req, res) {
	logger.debug("[RFQ_controller] :: insertRFQ() Start");
	try {
		const reqFileData = req.body;
		var rfqDetails = await rfqService.insertRFQsData(reqFileData, req.params.status, basicUtil.getTokenUserId(req));
		logger.debug("[RFQ_controller] :: insertRFQ()( End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_adding_RFQ')
			},
			payload: rfqDetails
		});
	} catch (error) {
		logger.error("[RFQ_controller] ::insertRFQ()() : error : " + error);
		return res.status(400).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_adding_RFQ')
			},
			payload: null
		});

	}
}


exports.getRFQData = async function (req, res) {
	logger.debug("[RFQ_controller] :: getRFQData() Start");
	try {
		var rfqs = await rfqService.getRFQData(req.params.noOfRfqs);
		logger.debug("[RFQ_controller] :: getRFQData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_RFQ_Data')
			},
			payload: rfqs
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getRFQData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_RFQ_Data')
			},
			payload: null
		});
	}
}

exports.deleteRFQ = async function (req, res) {
	logger.debug("[RFQ_controller] :: deleteRFQ() Start");
	try {
		//var rfqDetails = await rfqService.insertRFQsData(req.body.rfq);
		var rfqs = await rfqService.deleteRFQ(req.body.lc, req.body.rfq);
		logger.debug("[RFQ_controller] :: deleteRFQ()() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Removed_RFQ')
			},
			payload: rfqs
		});
	} catch (error) {
		logger.error("[RFQ_controller] ::deleteRFQ() : error : " + error);
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

exports.notifyUser = async function (req, res) {
	logger.debug("[RFQ_controller] :: notifyUser() Start");
	try {
		//var rfqDetails = await rfqService.insertRFQsData(req.body.rfq);
		var rfqs = await rfqService.notifyUser(req.body.lc, req.body.rfq, req.body.updatedRFQ);
		logger.debug("[RFQ_controller] :: notifyUser()() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Send_Email')
			},
			payload: rfqs
		});
	} catch (error) {
		logger.error("[RFQ_controller] ::notifyUser() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_sending_Email')
			},
			payload: null
		});
	}
}

exports.isActiveProjectType = async function (req, res) {
	logger.debug("[RFQ_controller] :: isActiveProjectType() Start");
	try {
		//var rfqDetails = await rfqService.insertRFQsData(req.body.rfq);
		var projectType = await rfqService.isActiveProjectType(req.body.projectType);
		logger.debug("[RFQ_controller] :: isActiveProjectType()() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Send_Email')
			},
			payload: projectType
		});
	} catch (error) {
		logger.error("[RFQ_controller] ::isActiveProjectType() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_sending_Email')
			},
			payload: null
		});
	}
}

exports.getLettersOfClarification = async function (req, res) {
	logger.debug("[RFQ_controller] :: getLettersOfClarification() Start");
	try {
		var lettersOfClarification = await rfqService.getLettersOfClarification(req.params.rfq);
		logger.debug("[RFQ_controller] :: getLettersOfClarification() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_LC')
			},
			payload: lettersOfClarification
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getLettersOfClarification() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_LC')
			},
			payload: null
		});
	}
}

exports.getRFQProjectType = async function (req, res) {
	logger.debug("[RFQ_controller] :: getRFQProjectType() Start");
	try {
		var projectType = await rfqService.getRFQProjectType(req.params.rfq);
		logger.debug("[RFQ_controller] :: getRFQProjectType() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Project_Type')
			},
			payload: projectType
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getRFQProjectType() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Project_Type')
			},
			payload: null
		});
	}
}

exports.getSearchResults = async function (req, res) {
	logger.debug("[RFQ_controller] :: getSearchResults() Start");
	try {
		var result = await rfqService.getSearchResults(req.body, req.params.noOfRfqs);
		logger.debug("[RFQ_controller] :: getSearchResults() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getSearchResults() : error : " + error);
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

exports.download = async function (req, res) {
	console.log(req.body)
	logger.debug("[RFQ_controller] :: download() Start");
	try {
		var result = await fileDownloadUtil.downloadFile(req.body)
		logger.debug("[RFQ_controller] :: download() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: download() : error : " + error);
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

// Get SOQ status for all the RFQs for a given vendor
exports.getSOQStatus = async function (req, res) {
	logger.debug("[RFQ_controller] :: getSOQStatus() Start");
	try {
		var result = await rfqService.getSOQStatus(req.params.vendorId)
		logger.debug("[RFQ_controller] :: getSOQStatus() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getSOQStatus() : error : " + error);
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

// Get RFQ details by RFQ Id
exports.getRFQDetailsByRFQId = async function (req, res) {
	logger.debug("[RFQ_controller] :: getRFQDetailsByRFQId() Start");
	try {
		var result = await rfqService.getRFQDetailsByRFQId(req.params.rfqId)
		logger.debug("[RFQ_controller] :: getRFQDetailsByRFQId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getRFQDetailsByRFQId() : error : " + error);
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

// Get matching HPW100s for the RFQ
exports.getMatchingHPW100sByRFQ = async function (req, res) {
	logger.debug("[RFQ_controller] :: getMatchingHPW100sByRFQ() Start");
	try {
		var result = await rfqService.getMatchingHPW100sByRFQ(req.params.rfqId, req.params.vendorId)
		logger.debug("[RFQ_controller] :: getMatchingHPW100sByRFQ() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getMatchingHPW100sByRFQ() : error : " + error);
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

exports.getRFQByTitle = async function (req, res) {
	logger.debug("[RFQ_controller] :: getRFQByTitle() Start");
	try {
		var result = await rfqService.getRFQByTitle(req.body.title)
		logger.debug("[RFQ_controller] :: getRFQByTitle() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_RFQ')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getRFQByTitle() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_RFQ')
			},
			payload: null
		});
	}
}

exports.closeRFQ = async function (req, res) {
	logger.debug("[RFQ_controller] :: closeRFQ() Start");
	try {
		await rfqService.closeRFQ().then((data) => {
			console.log(data)
			if (data.Payload === 'true') {
				return res.status(200).json({
					status: {
						code: 200,
						name: i18n.__('Success'),
						message: i18n.__('Successfully_Closed_RFQ')
					},
					payload: data.Payload
				});
			} else {
				return res.status(500).json({
					status: {
						code: 500,
						name: i18n.__('Error'),
						message: i18n.__('Error_Closing_RFQ')
					},
					payload: null
				});
			}
		}).catch((error) => {
			logger.error("[RFQ_controller] :: closeRFQ() : error : " + error);
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Closing_RFQ')
				},
				payload: null
			});
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: closeRFQ() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Closing_RFQ')
			},
			payload: null
		});
	}
}

// Get No of active RFQs
exports.getNoOfActiveRFQs = async function (req, res) {
	logger.debug("[RFQ_controller] :: getNoOfActiveRFQs() Start");
	try {
		var result = await rfqService.getNoOfActiveRFQs()
		logger.debug("[RFQ_controller] :: getNoOfActiveRFQs() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_No_Of_Active_RFQs')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getNoOfActiveRFQs() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_No_Of_Active_RFQs')
			},
			payload: null
		});
	}
}

exports.getRFQsForExistingLCs = async function (req, res) {
	logger.debug("[RFQ_controller] :: getRFQsForExistingLCs() Start");
	try {
		var result = await rfqService.getRFQsForExistingLCs(req.body)
		logger.debug("[RFQ_controller] :: getRFQsForExistingLCs() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_RFQs_For_LCs')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[RFQ_controller] :: getRFQsForExistingLCs() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_RFQs_For_LCs')
			},
			payload: null
		});
	}
}