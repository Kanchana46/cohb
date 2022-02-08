const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const logsService = require("../services/logs_service");

exports.getLogs = async function (req, res, next) {
	logger.debug("[log_controller] :: getLogs() Start");
	try {		
		var logs = await logsService.getLogs(req.query.noOfLogs, req.query.searchText, req.query.role, req.query.resource, req.query.startDate, req.query.endDate);
		logger.debug("[log_controller] :: getLogs() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Logs')
			},
			payload: logs
		});
	} catch (error) {
		logger.error("[log_controller] :: getLogs() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Logs')
			},
			payload: null
		});

	}
};