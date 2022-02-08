const db = require("../db/dbconnection");
const uuidv1 = require('uuid/v1');
var bcrypt = require('bcryptjs');
var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var config = require('config')
const moment = require('moment')
const logger = require('../util/log4jsutil');
const basicUtil = require("../util/basicutil")
const userModel = require("../models/user_model");
const userLoginInfoModel = require('../models/userlogininfo_model');
const userPwRestModel = require('../models/userpwreset_model');
const mailUtil = require('../util/mailutil');
const psVendorModel = require("../models/professional_vendor_model");
const csVendorModel = require("../models/construction_vendor_model");
const logModel = require('../models/log_model')
const notificationModel = require('../models/notification_model');
const fileDownloadUtil = require('../util/fileDownloadutil');

exports.getAllUsers = async function () {
    logger.debug("[getAllUsers()] : Start");
    const allUsers = await userModel.getAllUsers()
    logger.trace("[getAllUsers()] : End");
    return allUsers
}

exports.getUserById = async function (id) {
    logger.debug("[getUserById()] : Start");
    const user = await userModel.getUserById(id)
    logger.trace("[getUserById()] : End");
    return user;
}

// Subscribe user.
exports.subscribeUser = async function (subscriber) {
    logger.debug("[user_service] :: subscribeUser() : Start");
    // Check whether email address already exists in subscribe users list.
    const emailExist = await userModel.checkSubscriptionEmailAvailability(subscriber.email)
    if (emailExist[0].emailAvailable == 0) {
        // If email is already subscribed error will be returned.
        throw new Error('Email exists');
    } else {
        const subscriberSave = await userModel.subscribeUser(subscriber)
        // If subscription is successful confirmation email will be sent.
        if (subscriberSave == 1) {
            //send the confirmation email
            const mailOptions = {
                //from: "", // Sender address
                to: subscriber.email,
                subject: "City of Houston Vendor Portal" + ' - Subscription Confirmation', // Subject line
                html: "<p>Hi " + subscriber.name + "</p>" +
                    "<p>This is a confirmation email that you have been successfully subscribed to the City of Houston Vendor Portal.</b></p>" +
                    "<p>Thank You,</p>" +
                    "<p>City of Houston Vendor Portal</p>"
            };
            const mailSent = await mailUtil.sendMail(mailOptions);
            logger.debug("[user_service] :: subscribeUser() : mailSent : {" + mailSent + " }");
            if (mailSent) {
                logger.trace("[user_service] :: subscribeUser()  : End");
                return subscriberSave;
            } else {
                throw new Error('Email sending failed');
            }
        }
    }
}

// Unsubscribe user.
exports.unsubscribe = async function (email) {
    logger.debug("[user_service] :: unsubscribe() : Start");
    const unsubscription = await userModel.unsubscribe(email)
    logger.trace("[user_service] :: unsubscribe()  : End");
    return unsubscription;
}

// Vendor will be registered as new user.
exports.registerVendor = async function (vendor) {
    logger.debug("[user_service] :: registerVendor() : Start");
    const usernameAvailable = await this.checkUsernameAvailability(vendor.userName)
    const emailAvailable = await this.checkEmailAvailability(vendor.emailAddress)
    const taxIdAvailable = await this.checkTaxIdAvailability(vendor.taxId)
    logger.debug(usernameAvailable)
    logger.debug(emailAvailable)
    logger.debug(taxIdAvailable)
    if (usernameAvailable[0].usernameAvailable == 1 && emailAvailable[0].emailAvailable == 1 && taxIdAvailable[0].taxIdAvailable == 1) {
        // Password encription.
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(vendor.password, salt);
        // Calculate password expiry time.
        let passwordExpiryTime = config.get('PasswordExpiryTime').replace("d", "");
        let currentTime = moment();
        let expiryTime = moment(currentTime).add(passwordExpiryTime, 'days');
        vendor.Password = hash;
        vendor.passwordExpiryTime = expiryTime.utc().format('YYYY-MM-DD HH:mm');
        // Get the user role id.
        let userRoleName;
        if (vendor.roleId == 'PS') {
            userRoleName = 'ps vendor'
        } else if (vendor.roleId == 'CS') {
            userRoleName = 'cs vendor'
        }
        const roleId = await userModel.getUserRolebyDescription(userRoleName);
        vendor.roleId = roleId[0].Id;
        // Insert user to user table.
        const userId = await userModel.saveUser(vendor)
        if (userId != null) {
            // Insert user role.
            const UserRoleSave = await userModel.saveUserRole(vendor.roleId, userId);
            // Insert password details to old password table.
            const UserOldPasswordSave = await userModel.saveUserOldPassword(userId, currentTime.utc().format('YYYY-MM-DD HH:mm'), hash)
            // Add new user to relevant vendor table according to the role.
            if (userRoleName == 'ps vendor') {
                const vendorSave = await userModel.saveProfessionalVendor(vendor, userId);
                await userModel.subscribeUserForRFQUpdates(vendor.userName, vendor.company, vendor.emailAddress);
                var psVendor = await psVendorModel.getPSVendorByUserId(userId)
                if (psVendor.length > 0) {
                    await logModel.addLog("ps vendor", config.get('ResourceTypes.Account'), "Registered", psVendor[0].Id, userId)
                }
            } else if (userRoleName == 'cs vendor') {
                const vendorSave = await userModel.saveConstructionVendor(vendor, userId);
                var csVendor = await csVendorModel.getCSVendorIdByUserId(userId)
                if (csVendor.length > 0) {
                    await logModel.addLog("cs vendor", config.get('ResourceTypes.Account'), "Registered", csVendor[0].Id, userId)
                }
            }
        }
        logger.debug("[user_service] :: registerVendor() : { " + vendor.userName + " }");
        if (!empty(vendor.userName)) {
            //send the confirmation email.
            const mailOptions = {
                //from: "", // Sender address
                to: vendor.emailAddress,
                subject: "City of Houston Vendor Portal" + ' - Registration Confirmation', // Subject line
                /*html: "<p>Hi " + vendor.company + "</p>" +
                    "<p>This is a confirmation email that you have been registered as " + (userRoleName == 'ps vendor' ? 'Professional Services Vendor' : (userRoleName == 'cs vendor' ? 'Construction Services Vendor' : 'Vendor')) + " with Username : <b>" + vendor.userName + "</b></p>" +
                    "<p>Thank You,</p>" +
                    "<p>City of Houston Vendor Portal</p>"*/
                html: "<p>You have been registered as a " + (userRoleName == 'ps vendor' ? 'Professional Services Vendor' : (userRoleName == 'cs vendor' ? 'Construction Services Vendor' : 'Vendor')) + " with Username : " + vendor.userName + "</p>" +
                    "<p>Thank You,</p>" +
                    "<p>City of Houston Vendor Portal</p>"
            };
            const mailSent = await mailUtil.sendMail(mailOptions);
            logger.debug("[user_service] :: registerVendor() : mailSent : {" + mailSent + " }");
            if (mailSent) {
                logger.trace("[user_service] :: registerVendor()  : End");
                return {
                    userId: userId
                };
            } else {
                throw new Error('Email sending failed');
            }
        }
    } else {
        return {
            InvalidUser: true,
            usernameAvailable: usernameAvailable[0].usernameAvailable,
            emailAvailable: emailAvailable[0].emailAvailable,
            taxIdAvailable: taxIdAvailable[0].taxIdAvailable
        }
    }


}

// Check whether username already exists.
exports.checkUsernameAvailability = async function (inputValue) {
    logger.debug("[user_service] :: checkUsernameAvailability() : Start");
    const usernameAvailable = await userModel.checkUsernameAvailability(inputValue)
    logger.trace("[user_service] :: checkUsernameAvailability()  : End");
    return usernameAvailable;
};

exports.loginUser = async function (userName, password, deviceId) {
    logger.debug("loginUser() : Start");
    const users = await userModel.loginUser(userName)
    if (!empty(users)) {
        if (users[0].Password !== null) {
            const isSamePwd = await bcrypt.compare(password, users[0].Password);
            if (isSamePwd) {
                //get the user roles for the user
                const userRole = await userModel.getUserRolesByUserId(users[0].Id);
                const roleCapabilities = await userModel.getRoleCapabilityByUserId(users[0].Id);
                if (new Date(users[0].PasswordExpiryTime) > new Date()) {
                    //generate the token and send
                    const token = await basicUtil.generateJWT(users);
                    const refreshToken = await basicUtil.generateRandomNum();
                    var Id = uuidv1()
                    //generate session expiry time
                    let sessionTime = config.get('AppSessionTime')
                    let sessionExpiryTime = sessionTime.replace("h", "");
                    const expiryDate = moment().add(sessionExpiryTime, 'hours');
                    let currentDate = moment();
                    let lastAccessTime = currentDate.utc().format('YYYY-MM-DD HH:mm');
                    const insertUserData = await userLoginInfoModel.insertUserLoginInfo(Id, users[0].Id,
                        deviceId, refreshToken, expiryDate.utc().format('YYYY-MM-DD HH:mm'), lastAccessTime)
                    logger.trace("loginUser() : End");
                    return {
                        message: "Success",
                        user: users,
                        userRole: userRole[0].Description,
                        //isSuperAdmin: userRole[0].isSuperAdmin,
                        token: token,
                        refreshToken: refreshToken,
                        roleCapabilities: roleCapabilities[0].allowedItems
                    }
                } else {
                    //pwds is expired
                    return {
                        message: "Password is expired",
                        user: users,
                        userRole: userRole[0].Description
                    }
                }
            } else {
                //pwds are different
                throw new Error('Invalid user');
            }
        } else {
            //user has not created a password using password reset link
            throw new Error('Invalid user');
        }

    } else {
        //user does not exists
        throw new Error('Invalid user');
    }
};

// Check whether email already exists.
exports.checkEmailAvailability = async function (inputValue) {
    logger.debug("[user_service] :: checkEmailAvailability() : Start");
    const emailAvailable = await userModel.checkEmailAvailability(inputValue)
    logger.trace("[user_service] :: checkEmailAvailability()  : End");
    return emailAvailable;
}

// Check whether tax id already exists.
exports.checkTaxIdAvailability = async function (inputValue) {
    logger.debug("[user_service] :: checkTaxIdAvailability() : Start");
    const taxIdAvailable = await userModel.checkTaxIdAvailability(inputValue)
    logger.trace("[user_service] :: checkTaxIdAvailability()  : End");
    return taxIdAvailable;
}

exports.checkPasswordAvailability = async function (passwordEnc, reqUserId, reqId) {
    logger.debug("[user_service] :: checkPasswordAvailability() : Start" + reqUserId, reqId);
    let password = await basicUtil.decodeBase64(passwordEnc);
    let userId
    if (reqUserId == 'undefined') {

        const getUserId = await userPwRestModel.getUserIdByRequestId(reqId)
        userId = getUserId[0].UserId
    } else {
        userId = reqUserId
    }
    const user = await userModel.getUserById(userId);
    let count = config.get('OldPaswordCount')
    const getPassword = await userModel.checkPasswordAvailability(userId, count)

    let userPasswordArray = [];
    for (let i = 0; i < getPassword.length; i++) {
        const isSamePwd = await bcrypt.compare(password, getPassword[i].password);

        if (isSamePwd) {
            userPasswordArray.push(getPassword[i].password)
        }
    }
    logger.trace("[user_service] :: checkPasswordAvailability()  : End");
    return {
        count: userPasswordArray.length,
        user: user
    };
}


exports.refreshToken = async function (userIdEncoded, deviceIdEncoded, refreshToken) {
    logger.debug("[user_service] :: refreshToken() : { " + userIdEncoded, deviceIdEncoded, refreshToken + " }");
    const deviceId = await basicUtil.decodeBase64(deviceIdEncoded);
    const userId = await basicUtil.decodeBase64(userIdEncoded);
    const loginInfo = await userLoginInfoModel.getUserLoginInfo(userId, deviceId);
    if (!empty(loginInfo)) {
        const refreshTok = loginInfo[0].RefreshToken;
        const user = await userModel.getUserById(userId);
        if (refreshToken === refreshTok) {
            //tokens match
            let lastAccessTime = moment(loginInfo[0].LastAccessTime, 'YYYY-MM-DD HH:mm');
            let currentTime = moment(new Date(), 'YYYY-MM-DD HH:mm');
            var duration = moment.duration(currentTime.diff(lastAccessTime));
            var hoursDiff = duration.asHours();
            let sessionInactiveTime = config.get('SessionIdlePeriod').replace("h", "");
            logger.debug("[user_service] :: refreshToken() : sessionInactiveTime : { " + sessionInactiveTime + " }");
            logger.debug("[user_service] :: refreshToken() : hoursDiff : { " + hoursDiff + " }");
            if ((sessionInactiveTime > hoursDiff)) {
                //within the time, so we can extend the session
                //generate the token and send
                let sessionExpiryTime = config.get('AppSessionTime').replace("h", "");
                let currentDate = moment();
                const expiryDate = moment().add(sessionExpiryTime, 'hours');
                let lastAccessTime = currentDate.utc().format('YYYY-MM-DD HH:mm');
                await userLoginInfoModel.updateUserLoginInfo(loginInfo[0].Id, expiryDate.utc().format('YYYY-MM-DD HH:mm'), lastAccessTime);
                const token = await basicUtil.generateJWT(user);
                logger.trace("[user_service] :: refreshToken()  : End");
                return {
                    token: token
                }
            } else {
                //inactive more than the defined time
                //so we don't renew the session
                throw new Error('Session Expired');
            }
        }
    } else {
        throw new Error('Invalid Token');
    }
}

exports.requestPasswordReset = async function (userNameEnc, emailEnc, requestIPEnc, status) {
    logger.debug("[user_service] :: requestPasswordReset() : { " + emailEnc, requestIPEnc + " }");
    let email;
    let userName;
    if (status) {
        email = emailEnc;
        userName = userNameEnc;
    } else {
        email = await basicUtil.decodeBase64(emailEnc);
        userName = await basicUtil.decodeBase64(userNameEnc)
    }
    logger.debug("[user_service] :: requestPasswordReset() : { " + email, userName + " }");
    const user = await userModel.getUserByEmail(userName, email); //capture user email by using user id
    let requestId = uuidv1();
    if (!empty(user)) {
        const updateResetPassword = await userPwRestModel.updateResetPasswordByUserId(user[0].Id)
        //if user exists by email, send a pwd reset link
        let currentTime = moment();
        let passwordLinkValidTime = config.get('PasswordLinkValidPeriod').replace("h", "");
        const expiryTime = moment(currentTime).add(passwordLinkValidTime, 'hours').utc().format('YYYY-MM-DD HH:mm')
        const requestIP = await basicUtil.decodeBase64(requestIPEnc);
        const keyCode = await basicUtil.generateRandomNum();
        await userPwRestModel.insertPasswordRequest(requestId, user[0].Id, expiryTime, keyCode, requestIP);
        const role = await userModel.getUserRolesByUserId(user[0].Id);
        const userRole = role[0].Description
        let iscoh;
        if (userRole == "super admin" || userRole == "admin" || userRole == "coh" || userRole == "cs admin") {
            iscoh = true;
        } else {
            iscoh = false;
        }
        //send the mail
        let sendUrl = process.env.CLIENT_URL + "/resetpassword?reqId=" + requestId + "&keyCode=" + keyCode + "&iscoh=" + iscoh;

        //const role = await userModel.getUserRolesByUserId(user[0].Id);
        const mailOptions = {
            //from: "", // Sender address
            to: email, // List of recipients
            subject: "City of Houston Vendor Portal" + ' - Password Reset Request', // Subject line
        };
        let htmlText = "<p>Dear City of Houston Vendor Portal user,</p>"

        if (userRole == 'super admin' || userRole == 'admin' ||
            userRole == 'coh' || userRole == 'cs admin') {
            htmlText += "<p>Your username to access portal is " + user[0].UserName + "</p>"
        }
        htmlText += "<p>Please use the link below within 24 hours.</p>" +
            "<a href='" + sendUrl + "' target='_blank'>Reset password</a>"

        if (role[0].Description == 'cs admin') {
            const docName = "ConstructionAdmin_UserGuide.pdf";
            const S3PDF = await fileDownloadUtil.getCommonFiles(docName);
            htmlText += "<p>If you are having trouble navigating inside the Vendor Portal you may use the attached document for further guidance.</p>"
            mailOptions.attachments = {
                filename: docName,
                contentType: 'application/pdf',
                content: S3PDF
            }
        } else {
        }
        htmlText += "<p>Thank You,</p>" +
            "<p>City of Houston Vendor Portal</p>"
        mailOptions.html = htmlText;

        const mailSent = await mailUtil.sendMail(mailOptions);
        logger.debug("[user_service] :: loginUser() : mailSent : {" + mailSent + " }");
        if (mailSent) {
            return true;
        } else {
            throw new Error('Email sending failed');
        }
    } else {
        // user doesn't exist
        throw new Error('Account not verified');
    }
}

exports.resetPassword = async function (reqId, keyCode, deviceIp, reqUserId, newPassword, confirmPassword) {
    logger.debug("[user_service] :: resetPassword() :" + deviceIp);
    //we don't need to veryfy link when password is expired 
    let userId
    if (empty(reqUserId)) {
        const getUserId = await userPwRestModel.getUserIdByRequestId(reqId)
        userId = getUserId[0].UserId
    } else {
        userId = reqUserId
    }

    const user = await userModel.getUserById(userId);
    if (newPassword == confirmPassword) {
        if (!empty(reqId) && !empty(keyCode)) {
            //validate the request here again, before resetting the password
            const isValidRequest = await this.validatePasswordResetLink(reqId, keyCode, deviceIp);
            if (isValidRequest) {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(newPassword, salt);
                let passwordExpiryTime = config.get('PasswordExpiryTime').replace("d", "");
                let currentTime = moment();
                const expiryTime = moment(currentTime).add(passwordExpiryTime, 'days').utc().format('YYYY-MM-DD HH:mm')
                await userModel.resetPassword(userId, hash, expiryTime); //reset password in user table	
                await userPwRestModel.updateIsActivated(reqId); // update user_reset_password table
                await userModel.saveUserOldPassword(userId,
                    currentTime.utc().format('YYYY-MM-DD HH:mm'), hash) // update old pw
                const userRole = await userModel.getUserRolesByUserId(user[0].Id);
                return {
                    userRole: userRole[0].Description
                }
                return result;
            } else {
                //if the requestid and key code are not correct or request expired
                throw new Error('Invalid Request');
            }
        } else {
            //reset expired password 
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            let passwordExpiryTime = config.get('PasswordExpiryTime').replace("d", "");
            let currentTime = moment();
            const expiryTime = moment(currentTime).add(passwordExpiryTime, 'days').utc().format('YYYY-MM-DD HH:mm')
            await userModel.resetPassword(userId, hash, expiryTime); //reset password in user table
            await userModel.saveUserOldPassword(userId,
                currentTime.utc().format('YYYY-MM-DD HH:mm'), hash) // update old pw
            const userRole = await userModel.getUserRolesByUserId(user[0].Id);
            return {
                userRole: userRole[0].Description
            }
        }
    } else {
        throw new Error('Invalid Request');
    }
}

exports.validatePasswordResetLink = async function (reqId, keyCode) {
    logger.debug("[user_service] :: validatePasswordResetLink() : ");
    const result = await userPwRestModel.getPWResetDataByReqId(reqId, keyCode);
    if (!empty(result)) {
        if (new Date(result[0].ResetExpiryTime) > new Date()) {
            //if a request exists for that key code with the request id and  if it is not expired
            return true;
        } else {
            throw new Error('Link not valid');
        }
    } else {
        throw new Error('Link not valid');
    }
}

// Get username by email address and send an email with username.
exports.requestUsername = async function (emailEnc, requestIPEnc) {
    logger.debug("[user_service] :: requestUsername() : { " + emailEnc, requestIPEnc + " }");
    const email = await basicUtil.decodeBase64(emailEnc);
    // Get the username.
    const user = await userModel.getUsernameByEmail(email);
    let requestId = uuidv1();
    const role = await userModel.getUserRoleByUserEmail(email);
    const userRole = role[0].Description;
    let sendUrl = ''
    process.env.CLIENT_URL + "/resetpassword?reqId=" + "&iscoh=";
    if (userRole == "super admin" || userRole == "admin" || userRole == "coh" || userRole == "cs admin") {
        sendUrl = process.env.CLIENT_URL + "/login/admin";
    } else {
        sendUrl = process.env.CLIENT_URL + "/";
    }

    if (!empty(user)) {
        //send the mail
        const mailOptions = {
            //from: "", // Sender address
            to: email, // List of recipients
            subject: "City of Houston Vendor Portal" + ' - Username Request', // Subject line
            html: /*"<p>Hi,</p>" +*/
                "<p>Your Username for City of Houston Vendor Portal is " + user[0].UserName + "</p>" +
                "<p>You may access the portal using the following link:</p>" +
                "<a href='" + sendUrl + "' target='_blank'>City of Houston Vendor Portal </a>" +
                "<p>Thank You,</p>" +
                "<p>City of Houston Vendor Portal</p>"
        };
        const mailSent = await mailUtil.sendMail(mailOptions);
        logger.debug("[user_service] :: requestUsername() : mailSent : {" + mailSent + " }");
        if (mailSent) {
            return true;
        } else {
            throw new Error('Email sending failed');
        }
    } else {
        // user doesn't exist
        throw new Error('Account not verified');
    }
}

exports.addCityUser = async function (cityUser, loggedInUserId) {
    logger.debug("[users_service] :: addCityUser() : Start");
    const roleId = await userModel.getUserRolebyDescription(cityUser.role);
    const userId = await userModel.addCityUser(cityUser);
    if (userId != null) {
        const UserRoleSave = await userModel.saveUserRole(roleId[0].Id, userId);
        await this.requestPasswordReset(cityUser.userName, cityUser.emailAddress, cityUser.deviceIp, true);
    }
    await logModel.addLog("Admin", config.get('ResourceTypes.User'), `User - ${cityUser.userName} added`, loggedInUserId == null ? '' : loggedInUserId, loggedInUserId == null ? '' : loggedInUserId)
    logger.trace("[users_service] :: addCityUser()  : End");
    return {
        userId: userId
    };
}

exports.updateCityUser = async function (cityUser, loggedInUserId) {
    logger.debug("[users_service] :: updateCityUser() : Start");
    const roleId = await userModel.getUserRolebyDescription(cityUser.role);
    const user = await userModel.updateCityUser(cityUser);
    if (user) {
        const UserRoleSave = await userModel.updateUserRole(roleId[0].Id, cityUser.id);
        if (cityUser.isEmailChanged) {
            await this.requestPasswordReset(cityUser.userName, cityUser.emailAddress, cityUser.deviceIp, true);
        }
    }
    await logModel.addLog("Admin", config.get('ResourceTypes.User'), `User - ${cityUser.userName} updated`, loggedInUserId == null ? '' : loggedInUserId, loggedInUserId == null ? '' : loggedInUserId)
    logger.trace("[users_service] :: updateCityUser()  : End");
    return {
        user: user
    };
}

exports.resetVendorEmail = async function (vendor, loggedInUserId) {
    logger.debug("[users_service] :: resetVendorEmail() : Start");
    const user = await userModel.resetVendorEmail(vendor);
    if (user) {
        if (vendor.isEmailChanged) {
            await this.requestPasswordReset(vendor.userName, vendor.emailAddress, vendor.deviceIp, true);
            await userModel.subscribeUserForRFQUpdates(vendor.userName, vendor.company, vendor.emailAddress);
        }
    }
    await logModel.addLog("Admin", config.get('ResourceTypes.User'), `User - ${vendor.userName} updated`, loggedInUserId == null ? '' : loggedInUserId, loggedInUserId == null ? '' : loggedInUserId)
    logger.trace("[users_service] :: resetVendorEmail()  : End");
    return user;
}

exports.getCityUsersWithRole = async function (noOfItems) {
    logger.debug("[users_service] :: getCityUsersWithRole() : Start");
    const user = await userModel.getCityUsersWithRole(noOfItems);
    logger.trace("[users_service] :: getCityUsersWithRole()  : End");
    return user;
}

exports.getVendorsWithRole = async function (noOfItems) {
    logger.debug("[users_service] :: getCityUsersWithRole() : Start");
    const user = await userModel.getVendorsWithRole(noOfItems);
    logger.trace("[users_service] :: getCityUsersWithRole()  : End");
    return user;
}

exports.getUserWithRole = async function (userId) {
    logger.debug("[users_service] :: getUserWithRole() : Start");
    const user = await userModel.getUserWithRole(userId);
    logger.trace("[users_service] :: getUserWithRole()  : End");
    return user;
}

exports.isUserNameExists = async function (user) {
    logger.debug("[users_service] :: getUserWithRole() : Start");
    const userName = await userModel.isUserNameExists(user);
    logger.trace("[users_service] :: getUserWithRole()  : End");
    return userName;
}

exports.getVendorByUserId = async function (userId) {
    logger.debug("[users_service] :: getVendorByUserId() : Start");
    const user = await userModel.getVendorByUserId(userId);
    logger.trace("[users_service] :: getVendorByUserId()  : End");
    return user;
}

exports.getSearchResults = async function (params, noOfItems) {
    logger.debug("[users_service] :: getCityUsersWithRole() : Start");
    const user = await userModel.getSearchResults(params, noOfItems);
    logger.trace("[users_service] :: getCityUsersWithRole()  : End");
    return user;
}

exports.getRoles = async function () {
    logger.debug("[users_service] :: getRoles() : Start");
    const roles = await userModel.getRoles();
    logger.trace("[users_service] :: getRoles()  : End");
    return roles;
}

exports.getCityUserSearchResults = async function (params, noOfCityUsers) {
    logger.debug("[users_service] :: getCityUserSearchResults() : Start");
    const data = await userModel.getCityUserSearchResults(params, noOfCityUsers);
    logger.trace("[users_service] :: getCityUserSearchResults()  : End");
    return data;
}

exports.getVendorSearchResults = async function (params, noOfCityUsers) {
    logger.debug("[users_service] :: getVendorSearchResults() : Start");
    const data = await userModel.getVendorSearchResults(params, noOfCityUsers);
    logger.trace("[users_service] :: getVendorSearchResults()  : End");
    return data;
}

exports.getVendorDetails = async function (Id) {
    logger.debug("[users_service] :: getVendorDetails() : Start");
    const data = await userModel.getVendorDetails(Id);
    logger.trace("[users_service] :: getVendorDetails()  : End");
    return data;
}

exports.updateVendorDetails = async function (params) {
    logger.debug("[users_service] :: updateVendorDetails() : Start");
    const data = await userModel.updateVendorDetails(params);
    if (data[0] > 0) {

        await logModel.addLog("Admin", config.get('ResourceTypes.Account'), `${params.company}'s company information updated`, params.updatedBy, params.updatedBy);
        let mailList = []
        const emails = await userModel.getEmailsByUserId(params.id);
        emails.forEach((data) => {
            if (data.email !== null) {
                mailList.push(data.email);
            }
        });
        const mailOptions = {
            to: mailList, // List of recipients
            subject: "City of Houston Vendor Portal", // Subject line
            html: "<p>Company Information - " + params.updatedFields.join(', ') + " of your profile was updated by City of Houston Administrator." + "</p>" +
                "<p>Thank You,</p>" +
                "<p>City of Houston Vendor Portal</p>"
        };
        const notification = {
            id: uuidv1(),
            userId: params.id,
            level: 2,
            subject: 'Profile information updated',
            body: mailOptions.html,
            sentTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        await notificationModel.addNotification(notification);
        const mailSent = await mailUtil.sendMail(mailOptions);
        if (mailSent) {
            return true;
        } else {
            throw new Error('Email sending failed');
        }
    }
    logger.trace("[users_service] :: updateVendorDetails()  : End");
    return data;
}

exports.getUserLoginInfoByUserId = async function (userId) {
    logger.debug("[users_service] :: getUserLoginInfoByUserId() : Start");
    const data = await userLoginInfoModel.getUserLoginInfoByUserId(userId);
    logger.trace("[users_service] :: getUserLoginInfoByUserId()  : End");
    return data;
}

// Adding data on user launch / cancel tour guide 
exports.addUserAdditionalInfo = async function (userId, isTourGuideLaunched) {
    logger.debug("[users_service] :: addUserAdditionalInfo() : Start");
    const data = await userModel.addUserAdditionalInfo(uuidv1(), userId, isTourGuideLaunched);
    logger.trace("[users_service] :: addUserAdditionalInfo()  : End");
    return data;
}

// To check if user has performed launch or cancel tour guide
exports.getUserAdditionalInfoByUserId = async function (userId) {
    logger.debug("[users_service] :: getUserAdditionalInfoByUserId() : Start");
    const data = await userModel.getUserAdditionalInfoByUserId(userId);
    logger.trace("[users_service] :: getUserAdditionalInfoByUserId()  : End");
    return data;
}

// Manage subscribed users - get user emails
exports.getSubscribers = async function (noOfSubscribers) {
    logger.debug("[users_service] :: getSubscribers() : Start");
    const data = await userModel.getSubscribers(noOfSubscribers);
    logger.trace("[users_service] :: getSubscribers()  : End");
    return data;
}

// Manage subscribed users - search by user email
exports.getSubscriberSearchResults = async function (noOfSubscribers, value) {
    logger.debug("[users_service] :: getSubscriberSearchResults() : Start");
    const data = await userModel.getSubscriberSearchResults(noOfSubscribers, value);
    logger.trace("[users_service] :: getSubscriberSearchResults()  : End");
    return data;
}

// Manage subscribed users - Enalbe/disable user emails 
exports.changeSubscriberStatus = async function (Id, status, loggedInUserId) {
    logger.debug("[users_service] :: changeSubscriberStatus() : Start");
    const isUpdated = await userModel.changeSubscriberStatus(Id, status);
    if (isUpdated == 1) {
        const data = await userModel.getSubscriberEmailById(Id);
        // Add Log
        await logModel.addLog("Admin", config.get('ResourceTypes.User'), `Email - ${data[0].Email} updated`,
            loggedInUserId == null ? '' : loggedInUserId, loggedInUserId == null ? '' : loggedInUserId);
    }
    logger.trace("[users_service] :: changeSubscriberStatus()  : End");
    return isUpdated;
}

//check if vendor is allowble to switch
exports.isVendorAllowedToSwitch = async function (userId, role) {
    logger.debug("[users_service] :: isVendorAllowedToSwitch() : Start");
    let isAllowedToSwitch = false;
    if (role == 'ps vendor') {
        const submittedSOQs = await userModel.getSOQStatusByUserId(userId);
        if (submittedSOQs[0].submittedCount == 0) {
            isAllowedToSwitch = true;
        } else {
            throw new Error(`Cannot switch vendor. SOQ(s) have been submitted, error`);
        }
    } else if (role == 'cs vendor') {
        const CRStatus = await userModel.getCRStatusByUserId(userId);
        if (CRStatus.length == 0 || CRStatus[0].Status == 'Pending') {
            isAllowedToSwitch = true;
        } else {
            throw new Error(`Cannot switch vendor. Construction Registration has been submitted., error`);
        }
    }
    logger.trace("[users_service] :: isVendorAllowedToSwitch()  : End");
    return isAllowedToSwitch;
}

// Switch PS vendor to CS vendor and vice versa
exports.switchVendor = async function (userId, role, loggedInUserId) {
    logger.debug("[users_service] :: switchVendor() : Start");
    return new Promise(async (resolve, reject) => {
        if (role == 'ps vendor') {
            userModel.switchToCSVendor(userId).then(async () => {
                resolve();
                const user = await userModel.getUserById(userId);
                logModel.addLog("super admin", config.get('ResourceTypes.User'),
                    `${user[0].Company} switched to Construction`,
                    loggedInUserId == null ? '' : loggedInUserId, loggedInUserId == null ? '' : loggedInUserId)
            }).catch(() => {
                reject('Error switching vendor.');
            });
        } else if (role == 'cs vendor') {
            userModel.switchToPSVendor(userId).then(async () => {
                resolve();
                const user = await userModel.getUserById(userId);
                logModel.addLog("super admin", config.get('ResourceTypes.User'),
                    `${user[0].Company} switched to Professional`,
                    loggedInUserId == null ? '' : loggedInUserId, loggedInUserId == null ? '' : loggedInUserId)
            }).catch(() => {
                reject('Error switching vendor.');
            });
        }
        logger.trace("[users_service] :: switchVendor()  : End");
    });
}





