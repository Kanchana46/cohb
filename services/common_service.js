const logger = require('../util/log4jsutil');
const constructionVendorModel = require("../models/construction_vendor_model");
const pjson = require('../package.json')
const maintenanceLogModel = require('../models/maintenance_log_model');

exports.getServerVersion = async function() {
    logger.debug("[common_service] :: getServerVersion() : Start");
    const version = pjson.version
    logger.trace("[common_service] :: getServerVersion()  : End");
    return version;
}

exports.getMaintenanceData = async function() {
    logger.debug("[common_service] :: getMaintenanceData() : Start");
    const version = maintenanceLogModel.getMaintenanceData();
    logger.trace("[common_service] :: getMaintenanceData()  : End");
    return version;
}