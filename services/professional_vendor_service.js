const db = require("../db/dbconnection");
const uuidv1 = require('uuid/v1');
var bcrypt = require('bcryptjs');
var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var config = require('config')
const logger = require('../util/log4jsutil');
const professionalVendorModel = require("../models/professional_vendor_model");
const userModel = require("../models/user_model");
const moment = require('moment')
const logModel = require('../models/log_model')
const hpw100Model = require("../models/HPW100_model");

// Update professional vendor profile by user id.
exports.updatePSVendorByVendorId = async function (professionalVendor, psUserId) {
    logger.debug("[professional_vendor_service] :: updatePSVendorByVendorId() :" + professionalVendor);
    let section = null;
    if (professionalVendor.profileSection == 'ProfileInformation') {
        // Get user id by vendor id.
        const getUserId = await professionalVendorModel.getUserIdByVendorId(professionalVendor.id)
        professionalVendor.userId = getUserId[0].UserId;
        // Convert established date in to database compatible format.
        if (professionalVendor.yearEstablished != null) {
            professionalVendor.yearEstablished.month = professionalVendor.yearEstablished.month - 1;
            convertedEstablishedDate = moment(professionalVendor.yearEstablished);
            professionalVendor.yearEstablished = convertedEstablishedDate.format('YYYY-MM-DD HH:mm:ss')
            /*tempDate = moment(professionalVendor.yearEstablished);
            convertedEstablishedDate = tempDate.subtract(1, 'months');
            professionalVendor.yearEstablished = convertedEstablishedDate.utc().format('YYYY-MM-DD HH:mm:ss');*/
        } else {
            professionalVendor.yearEstablished = null;
        }

        if (professionalVendor.totalPersonnel === '') {
            professionalVendor.totalPersonnel = 0;
        }
        // Update basic profile info.
        var vendorProfileUpdated = await professionalVendorModel.updateProfileInfoByVendorId(professionalVendor);
        section = "Company Information";
    } else if (professionalVendor.profileSection === 'AccManagerInformation') {
        var vendorProfileUpdated = await professionalVendorModel.updateAccManagerInfoByVendorId(professionalVendor);
        await userModel.subscribeUserForRFQUpdates(professionalVendor.actMgrName, professionalVendor.companyName, professionalVendor.actMgrEmail);
        section = "Account Manager Information";
    } else if (professionalVendor.profileSection == 'PrincipleContactInformation') {
        // Update vendor principal contact info.
        var vendorProfileUpdated = await professionalVendorModel.updatePrincipalContactInfoByVendorId(professionalVendor);
        await userModel.subscribeUserForRFQUpdates(professionalVendor.principalName, professionalVendor.companyName, professionalVendor.principalEmail);
        section = "Principal Contact Information";
    } else if (professionalVendor.profileSection == 'VendorServiceFee') {
        // Update vendor service fee.
        var vendorProfileUpdated = await professionalVendorModel.addProfessionalServiceFeeByVendorId(professionalVendor);
        section = "Summary of Professional Service Fees";
    } else if (professionalVendor.profileSection == 'AdditionalFulltimePersonnel') {
        // Update additional full time personnel data and vendor offices.
        var vendorProfileUpdated = await professionalVendorModel.updateAdditionalFulltimePersonnelByVendorId(professionalVendor);
        section = " Present Offices";
    } else if (professionalVendor.profileSection == 'FulltimePersonnel') {
        // Delete existing full time personnel info.
        var deleteCurrentFLPersonnelList = await professionalVendorModel.deleteFullTimePersonnelByVendorId(professionalVendor)
        // Insert new full time personnel info.
        var vendorProfileUpdated = await professionalVendorModel.addFulltimePersonnelByVendorId(professionalVendor);
        section = "Full Time Personnel";
    }


    await logModel.addLog("ps vendor", config.get('ResourceTypes.Profile'),
        `${section} of profile updated`, professionalVendor.id, psUserId)
    logger.trace("[professional_vendor_service] :: updatePSVendorByVendorId()  : End");
    return vendorProfileUpdated;
}

// Check tax id availability.
exports.checkTaxIdAvailability = async function (inputValue, id) {
    logger.debug("[professional_vendor_service] :: checkTaxIdAvailability() : Start");
    const getUserId = await professionalVendorModel.getUserIdByVendorId(id)
    let userId = getUserId[0].UserId
    const taxIdAvailable = await professionalVendorModel.checkTaxIdAvailability(inputValue, userId)
    logger.trace("[professional_vendor_service] :: checkTaxIdAvailability()  : End");
    return taxIdAvailable;
};

// Check certificate no availability.
exports.checkCertificationNoAvailability = async function (inputValue, id) {
    logger.debug("[professional_vendor_service] :: checkCertificationNoAvailability() : Start");
    const certificationNoAvailable = await professionalVendorModel.checkCertificationNoAvailability(inputValue, id)
    logger.trace("[professional_vendor_service] :: checkCertificationNoAvailability()  : End");
    return certificationNoAvailable;
};

// Check tx board of prof availability.
exports.checkTxBoardOfProfAvailability = async function (inputValue, id) {
    logger.debug("[professional_vendor_service] :: checkTxBoardOfProfAvailability() : Start");
    const txBoardOfProfAvailable = await professionalVendorModel.checkTxBoardOfProfAvailability(inputValue, id)
    logger.trace("[professional_vendor_service] :: checkTxBoardOfProfAvailability()  : End");
    return txBoardOfProfAvailable;
};

// Get professional vendor profile data.
exports.getPSVendorByUserId = async function (userId) {
    logger.debug("[professional_vendor_service] :: getPSVendorByUserId() : Start");
    // Get basic vendor data.
    const vendorData = await professionalVendorModel.getPSVendorByUserId(userId);
    tempDate = moment(vendorData[0].YearEstablished).utc();
    vendorData[0].YearEstablished = {
        year: parseInt(tempDate.format('YYYY')),
        month: parseInt(tempDate.format('MM')),
        day: parseInt(tempDate.format('DD'))
    };
    // Get user data by vendor id.
    const userData = await professionalVendorModel.getUserInfoByUserId(userId);
    vendorData[0].userData = userData[0];
    // Get full time personnel data by vendor id.
    const fullTimePersonnel = await professionalVendorModel.getFullTimePersonnelByVendorId(vendorData[0].Id);
    vendorData[0].fullTimePersonnel = fullTimePersonnel;
    // Get vendor offices by vendor id.
    const vendorOffices = await professionalVendorModel.getOfficesByVendorId(vendorData[0].Id);
    vendorData[0].vendorOffices = vendorOffices;
    // Get vendor fees by vendor id.
    const vendorFees = await professionalVendorModel.getServiceFeesByVendorId(vendorData[0].Id);
    vendorData[0].vendorFees = vendorFees;
    logger.trace("[professional_vendor_service] :: getPSVendorByUserId()  : End");
    return vendorData;
};

// Get states list.
exports.getAllStates = async function () {
    logger.debug("[professional_vendor_service] :: getAllStates() : Start");
    const states = await professionalVendorModel.getAllStates()
    logger.trace("[professional_vendor_service] :: getAllStates()  : End");
    return states;
};

// Get Full Time Personnel list.
exports.getFullTimePersonnel = async function () {
    logger.debug("[professional_vendor_service] :: getFullTimePersonnel() : Start");
    const states = await professionalVendorModel.getFullTimePersonnel()
    logger.trace("[professional_vendor_service] :: getFullTimePersonnel()  : End");
    return states;
};

// Get professional vendor profile status.
exports.getPSVendorProfileStatusByUserId = async function (userId) {
    logger.debug("[professional_vendor_service] :: getPSVendorProfileStatusByUserId() : Start");
    const profileStatus = await professionalVendorModel.getPSVendorProfileStatusByUserId(userId);
    logger.trace("[professional_vendor_service] :: getPSVendorProfileStatusByUserId()  : End");
    return profileStatus;
};

exports.getResourceDocuments = async function () {
    logger.debug("[professional_vendor_service] :: getResourceDocuments() : Start");
    const documents = await professionalVendorModel.getResourceDocuments();
    logger.trace("[professional_vendor_service] :: getResourceDocuments()  : End");
    return documents;
}

//get ps vendor info and connected hpw100
exports.getPSVendorANDHPW100ByUserId = async function (userId) {
    logger.debug("[professional_vendor_service] :: getPSVendorANDHPW100ByUserId() : Start");
    // Get basic vendor data.
    const vendorData = await professionalVendorModel.getPSVendorByUserId(userId);
    tempDate = moment(vendorData[0].YearEstablished);
    vendorData[0].YearEstablished = {
        year: tempDate.format('YYYY'),
        month: tempDate.format('MM'),
        day: tempDate.format('DD')
    };
    // Get user data by vendor id.
    const userData = await professionalVendorModel.getUserInfoByUserId(userId);
    vendorData[0].userData = userData[0];

    // get Hpw100 by vendorId
    const hpw100s = await hpw100Model.getHPW100ByVendorIdAndStatuSubmitted(vendorData[0].Id);
    vendorData[0].hpw100s = hpw100s;
    logger.trace("[professional_vendor_service] :: getPSVendorANDHPW100ByUserId()  : End");
    return vendorData;
};
