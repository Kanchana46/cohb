const logModel = require('../models/log_model')
const logger = require('../util/log4jsutil');

exports.getLogs = async function (noOfLogs, searchText, role, resource, startDate, endDate) {
	logger.debug("[log_service] :: getLogs() : Start");
	var logsList = await logModel.getLogs(noOfLogs, searchText, role, resource, startDate, endDate)
	logger.debug("[log_service] :: getLogs() : End");
	return logsList;
}