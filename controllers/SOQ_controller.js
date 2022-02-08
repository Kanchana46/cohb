const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const soqService = require("../services/SOQ_service");
const fileDownloadUtil = require('../util/fileDownloadutil');
const fs = require('fs');
const basicUtil = require('../util/basicutil');
// Get SOQ data by RFQ
exports.getSOQByRFQId = async function (req, res) {
	logger.debug("[SOQ_controller] :: getSOQByRFQId() Start");
	try {
		var soq = await soqService.getSOQByRFQId(req.body);
		logger.debug("[SOQ_controller] :: getSOQByRFQId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_SOQ')
			},
			payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getSOQByRFQId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_SOQ')
			},
			payload: null
		});
	}
}

// Get SOQ data by RFQ and vendor
exports.getSOQByRFQAndVendor = async function (req, res) {
	logger.debug("[SOQ_controller] :: getSOQByRFQAndVendor() Start");
	try {
		logger.debug("req.params=", req.params)
		var soq = await soqService.getSOQByRFQAndVendor(req.params.rfqId, req.params.vendorId);
		logger.debug("[SOQ_controller] :: getSOQByRFQAndVendor() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_SOQ')
			},
			payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getSOQByRFQAndVendor() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_SOQ')
			},
			payload: null
		});
	}
}

// Get HPW100s by vendor
exports.getHPW100sByVendorId = async function (req, res) {
	logger.debug("[SOQ_controller] :: getHPW100sByVendorId() Start");
	try {
		var soq = await soqService.getHPW100sByVendorId(req.params.vendorId);
		logger.debug("[SOQ_controller] :: getHPW100sByVendorId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_HPW100s')
			},
			payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getHPW100sByVendorId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_HPW100s')
			},
			payload: null
		});
	}
}

// Get professional service sub vendors
exports.getPSSubVendors = async function (req, res) {
	logger.debug("[SOQ_controller] :: getPSSubVendors() Start");
	try {
		var soq = await soqService.getPSSubVendors(req.params.vendorId);
		logger.debug("[SOQ_controller] :: getPSSubVendors() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_PS_Sub_Vendors')
			},
			payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getPSSubVendors() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_PS_Sub_Vendors')
			},
			payload: null
		});
	}
}

// Save SOQ details
exports.saveSOQDetails = async function (req, res) {
	logger.debug("[SOQ_controller] :: saveSOQDetails() Start");
	try {
		var soq = await soqService.saveSOQDetails(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[SOQ_controller] :: saveSOQDetails() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Save_SOQ_Details')
			},
			payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: saveSOQDetails() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Saving_SOQ_Details')
			},
			payload: null
		});
	}
}

// Save SOQ details and Submit
exports.submitSOQ = async function (req, res) {
	logger.debug("[SOQ_controller] :: submitSOQ() Start");
	try {
		var soq = await soqService.submitSOQ(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[SOQ_controller] :: submitSOQ() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Submit_SOQ')
			},
			payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: submitSOQ() : error : " + error);
		if (error.message.includes("invalid_data")) {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_submiting_invalid_SOQ_data')
				},
				payload: null
			});
		} else {
			if (!error.message.includes("reupload")) {
				return res.status(500).json({
					status: {
						code: 500,
						name: i18n.__('Error'),
						message: i18n.__('Error_Submitting_SOQ')
					},
					payload: null
				});
			} else {
				return res.status(500).json({
					status: {
						code: 500,
						name: i18n.__('Error'),
						message: i18n.__('Reupload_SOQ')
					},
					payload: null
				});
			}
		}
	}
}

// Upload SOQ document into the S3 bucket
exports.uploadSOQ = async function (req, res) {
	logger.debug("[SOQ_controller] :: uploadSOQ() Start");
	try {
		var soq = await soqService.uploadSOQ(req.file, req.body.soqId, req.body.fileName);
		logger.debug("[SOQ_controller] :: uploadSOQ() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Upload_SOQ')
			},
			//payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: uploadSOQ() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Uploading_SOQ')
			},
			payload: null
		});
	}
}

// Downlaod the SOQ document
exports.downloadSOQ = async function (req, res) {
	logger.debug("[SOQ_controller] :: downloadSOQ() Start");
	try {
		var result = await fileDownloadUtil.downloadFile(req.body)
		logger.debug("[SOQ_controller] :: downloadSOQ() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: downloadSOQ() : error : " + error);
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

// Downlaod the generated SOQ document
exports.downloadGeneratedSOQ = async function (req, res) {
	logger.debug("[SOQ_controller] :: downloadGeneratedSOQ() Start");
	try {
		var result = await fileDownloadUtil.downloadFile(req.body)
		logger.debug("[SOQ_controller] :: downloadGeneratedSOQ() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: downloadGeneratedSOQ() : error : " + error);
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

// Get SOQ generated document details by SOQ Id
exports.getGeneratedSOQDocDetails = async function (req, res) {
	logger.debug("[SOQ_controller] :: getGeneratedSOQDocDetails() Start");
	try {
		var soq = await soqService.getGeneratedSOQDocIdBySOQId(req.params.soqId);
		logger.debug("[SOQ_controller] :: getGeneratedSOQDocDetails() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_SOQ_Generated_Doc')
			},
			payload: soq
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getGeneratedSOQDocDetails() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Getting_SOQ_Generated_Doc')
			},
			payload: null
		});
	}
}

exports.getSubmissionData = async function (req, res) {
	logger.debug("[SOQ_controller] :: getSubmissionData() Start");
	try {
		//var soq = await soqService.downloadAll(req.body.vendorId, req.body.soqId, req.body.vendorName, req.body.rfqTitle);
		var data = await soqService.getSubmissionData(req.body.vendorId, req.body.soqId);
		logger.debug("[SOQ_controller] :: getSubmissionData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Submission_Data')
			},
			payload: data
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getSubmissionData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Submission_Data')
			},
			payload: null
		});
	}
}

exports.downloadAll = async function (req, res) {
	logger.debug("[SOQ_controller] :: downloadAll() Start");
	try {
		await soqService.downloadAll(req.body, (soq) => {
			if (soq.code === "NoSuchKey") { // Checks if one or more documents are not in S3
				return res.status(404).json({
					status: {
						code: soq.statusCode,
						name: i18n.__('Error'),
						message: i18n.__('Error_Downloading.One_Or_More_Files_Do_Not_Exist')
					},
					payload: null
				});
			} else {
				return res.status(200).json({
					status: {
						code: 200,
						name: i18n.__('Success'),
						message: i18n.__('Successfully_Downloaded')
					},
					payload: soq
				});
			}
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: downloadAll() : error : " + error);
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

exports.getAllSubmissionData = async function (req, res) {
	logger.debug("[SOQ_controller] :: getAllSubmissionData() Start");
	try {
		var data = await soqService.getAllSubmissionData(req.body);
		logger.debug("[SOQ_controller] :: getAllSubmissionData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Submission_Data')
			},
			payload: data
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getAllSubmissionData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Submission_Data')
			},
			payload: null
		});
	}
}

/*exports.downloadAllSubmissions = async function (req, res) {
	logger.debug("[SOQ_controller] :: downloadAllSubmissions() Start");
	try {
		await soqService.downloadAllSubmissions(req.body, req.params.downloadOption).then(
			data => {
				if (data.code == 'NoSuchKey') {  // Checks if one or more documents are not in S3
					return res.status(404).json({
						status: {
							code: data.statusCode,
							name: i18n.__('Error'),
							message: i18n.__('Error_Downloading.One_Or_More_Files_Do_Not_Exist')
						},
						payload: null
					});
				} else {
					return res.status(200).json({
						status: {
							code: 200,
							name: i18n.__('Success'),
							message: i18n.__('Successfully_Downloaded')
						},
						payload: data
					});
				}

			},
			error => {
				logger.error("[SOQ_controller] :: downloadAllSubmissions() : error : " + error);
				return res.status(500).json({
					status: {
						code: 500,
						name: i18n.__('Error'),
						message: i18n.__('Error_Downloading')
					},
					payload: null
				});
			}
		);
		logger.debug("[SOQ_controller] :: downloadAllSubmissions() End");
	} catch (error) {
		logger.error("[SOQ_controller] :: downloadAllSubmissions() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Downloading')
			},
			payload: null
		});
	}
}*/

/*exports.addDownloadAllSubmissionsLog = async function (req, res) {
	logger.debug("[SOQ_controller] :: getAllSubmissionData() Start");
	try {
		var data = await soqService.addDownloadAllSubmissionsLog(req.body.rfqTitle, basicUtil.getTokenUserId(req));
		logger.debug("[SOQ_controller] :: getAllSubmissionData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Added_Submission_Data_Log')
			},
			payload: data
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: getAllSubmissionData() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Adding_Submission_Data_Log')
			},
			payload: null
		});
	}
}*/

/** 
* CR #17
* Download All submissions for RFQ using SOQZipService
*/
exports.downloadAllSubmissions = async function (req, res) {
	logger.debug("[SOQ_controller] :: downloadAllSubmissions() Start");
	try {
		const data = await soqService.downloadAllSubmissions(req.body, req.params.downloadOption, basicUtil.getTokenUserId(req));
		logger.debug("[SOQ_controller] :: getAllSubmissionData() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Downloaded')
			},
			payload: data
		});
	} catch (error) {
		logger.error("[SOQ_controller] :: downloadAllSubmissions() : error : " + error);
		console.log(error.error)
		if (error.message == 'NotZipped') {
			return res.status(404).json({
				status: {
					code: 404,
					name: i18n.__('Error'),
					message: i18n.__('Error_Downloading_Zip')
				},
				payload: null
			});
		} else if (error.message == 'NotFound') {
			return res.status(404).json({
				status: {
					code: 404,
					name: i18n.__('Error'),
					message: i18n.__('File_Not_Found')
				},
				payload: null
			});
		} else {
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
}


