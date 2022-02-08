var empty = require('is-empty');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('config')
const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const userService = require("../services/user_service");
const basicUtil = require('../util/basicutil');

exports.getAllUsers = async function (req, res, next) {
	logger.debug("[user_controller] :: getAllUsers() Start");
	try {
		var users = await userService.getAllUsers();
		logger.debug("[user_controller] :: getAllUsers() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_User')
			},
			payload: users
		});
	} catch (error) {
		logger.error("[user_controller] :: getAllUsers() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Users')
			},
			payload: null
		});
	}
};

exports.getUserById = async function (req, res, next) {
	logger.debug("[user_controller] :: getUserById() Start");
	try {
		var userId = req.params.id;
		var users = await userService.getUserById(userId);
		logger.debug("[user_controller] :: getUserById() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_User')
			},
			payload: users
		});
	} catch (error) {
		logger.error("[user_controller] :: getUserById() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_User')
			},
			payload: null
		});
	}
};

exports.registerVendor = async function (req, res, next) {
	logger.debug("[user_controller] :: registerVendor() Start");
	try {
		var user = await userService.registerVendor(req.body);
		if (user.InvalidUser != undefined && user.InvalidUser) {
			logger.error("[user_controller] :: registerVendor() : error : Invalid user");
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Registering_Vendor')
				},
				payload: user
			});
		} else {
			logger.debug("[user_controller] :: registerVendor() End");
			return res.status(200).json({
				status: {
					code: 200,
					name: i18n.__('Success'),
					message: i18n.__('Successfully_Registerd_Vendor')
				},
				payload: user
			});
		}
	} catch (error) {
		logger.error("[user_controller] :: registerVendor() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Registering_Vendor')
			},
			payload: null
		});
	}
};

// Subscribe user.
exports.subscribeUser = async function (req, res, next) {
	logger.debug("[user_controller] :: subscribeUser() Start");
	try {
		var subsUser = await userService.subscribeUser(req.body);
		logger.debug("[user_controller] :: subscribeUser() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Subscribed_User')
			},
			payload: subsUser
		});
	} catch (error) {
		logger.error("[user_controller] :: subscribeUser() : error : " + error);
		if (error.message === 'Email exists') {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Email_Subscribed')
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Subscribing_Users')
				},
				payload: null
			});
		}
	}
};

// Unsubscribe user.
exports.unsubscribe = async function (req, res, next) {
	logger.debug("[user_controller] :: unsubscribe() Start");
	try {
		var unsubscription = await userService.unsubscribe(req.body.Email);
		logger.debug("[user_controller] :: unsubscribe() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Unsubscribed')
			},
			payload: unsubscription
		});
	} catch (error) {
		logger.error("[user_controller] :: unsubscribe() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Unsubscribe')
			},
			payload: null
		});
	}
};

// Check whether username already exists.
exports.checkUsernameAvailability = async function (req, res, next) {
	logger.debug("[user_controller] :: checkUsernameAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var userNameExists = await userService.checkUsernameAvailability(inputValue);
		logger.debug("[user_controller] :: checkUsernameAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: userNameExists
		});
	} catch (error) {
		logger.error("[user_controller] :: checkUsernameAvailability() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Validating_Input')
			},
			payload: null
		});
	}
};

exports.loginUser = async function (req, res, next) {
	logger.debug("[user_controller] :: loginUser() Start" + JSON.stringify(req.body));
	try {
		const userData = req.body
		const result = await userService.loginUser(userData.userName, userData.password, userData.deviceId);
		logger.debug("[user_controller] :: loginUser() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Authenticated_The_User')
			},
			payload: result
		});
	} catch (error) {
		console.log(error)
		logger.error("[user_controller] :: loginUser() : error : " + error);
		if (error.message === 'Invalid user') {
			res.status(401).json({
				status: {
					code: 401,
					name: i18n.__('Unauthorized'),
					message: i18n.__('Unauthorized')
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Internal_Server_Error'),
					message: i18n.__('Internal_Server_Error')
				},
				payload: null
			});
		}

	}
};

// Check whether email already exists.
exports.checkEmailAvailability = async function (req, res, next) {
	logger.debug("[user_controller] :: checkEmailAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var userNameExists = await userService.checkEmailAvailability(inputValue);
		logger.debug("[user_controller] :: checkEmailAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: userNameExists
		});
	} catch (error) {
		logger.error("[user_controller] :: checkEmailAvailability() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Validating_Input')
			},
			payload: null
		});
	}
};

// Check whether tax id already exists.
exports.checkTaxIdAvailability = async function (req, res, next) {
	logger.debug("[user_controller] :: checkTaxIdAvailability() Start");
	try {
		var inputValue = req.params.inputValue;
		var userNameExists = await userService.checkTaxIdAvailability(inputValue);
		logger.debug("[user_controller] :: checkTaxIdAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: userNameExists
		});
	} catch (error) {
		logger.error("[user_controller] :: checkTaxIdAvailability() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Validating_Input')
			},
			payload: null
		});
	}
};

exports.checkPasswordAvailability = async function (req, res, next) {
	logger.debug("[user_controller] :: checkPasswordAvailability() Start" + JSON.stringify(req.params));
	try {
		var password = req.params.password;
		var userId = req.params.userId
		var reqId = req.params.reqId
		var userNameExists = await userService.checkPasswordAvailability(password, userId, reqId);
		logger.debug("[user_controller] :: checkPasswordAvailability() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Validated_Input')
			},
			payload: userNameExists
		});
	} catch (error) {
		logger.error("[user_controller] :: checkPasswordAvailability() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Validating_Input')
			},
			payload: null
		});
	}
};

exports.refreshToken = async function (req, res) {
	logger.debug("[user_controller] :: refreshToken() : req : ");
	try {
		const userData = req.body;
		const refreshToken = userData.refreshToken;
		logger.trace("[user_controller] :: refreshToken() : refreshToken : " + refreshToken);
		const userId = req.headers['user-id'];
		logger.debug("[user_controller] :: refreshToken()  :: userId : " + userId);
		const deviceId = req.headers['device-id'];
		logger.debug("[user_controller] :: refreshToken()  :: deviceId : " + deviceId);

		try {
			//try to verify the auth token. //it should give the jwt expired message
			const token = req.headers["x-access-token"] || req.headers["authorization"];
			const decodedToken = await jwt.verify(token, config.get("privatekey"));
			//it shouldnt come here, as it should go to the catch with jwt expired
		} catch (ex) {
			//if invalid token
			logger.debug("[user_controller] :: refreshToken : " + ex.message);
			if (ex.message == "jwt expired") {
				//that means the authtoken is valid
				//so can continue with refresh token to send a new token          
				const result = await userService.refreshToken(userId, deviceId, refreshToken);
				logger.debug("[user_controller] :: refreshToken() : result : " + result);
				return res.status(200).json({
					status: {
						code: 200,
						name: i18n.__('Success'),
						message: i18n.__('Successfully_Refreshed_Token')
					},
					payload: result
				});
			} else {
				//shouldn't continue
			}
		}
		logger.error("[user_controller] :: refreshToken() : Error ");
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Refreshing_Token')
			},
			payload: null
		});

	} catch (error) {
		logger.error("[user_controller] :: refreshToken() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Refreshing_Token')
			},
			payload: null
		});
	}
};

exports.requestPasswordReset = async function (req, res) {
	try {
		const requestPasswordResetData = req.body;
		logger.trace("[user_controller] :: requestPasswordReset() : requestPasswordResetData : start" + JSON.stringify(requestPasswordResetData));
		const result = await userService.requestPasswordReset(requestPasswordResetData.UserName, requestPasswordResetData.Email, requestPasswordResetData.DeviceIP, false);
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Send_Request_For_Password_Reset')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[user_controller] :: requestPasswordReset() : error : " + error);
		if (error.message == 'Account not verified') {
			return res.status(401).json({
				status: {
					code: 401,
					name: i18n.__('Error'),
					message: i18n.__('Account_Not_Verified')
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Sending_Request_For_Password_Reset')
				},
				payload: null
			});
		}
	}
}

exports.resetPassword = async function (req, res) {
	logger.debug("[user_controller] :: resetPassword() : req : " + JSON.stringify(req.body));
	try {
		const passwordResetData = req.body;
		logger.trace("[user_controller] :: resetPassword() : passwordResetData : " + JSON.stringify(passwordResetData));

		const result = await userService.resetPassword(passwordResetData.ReqId, passwordResetData.KeyCode, passwordResetData.DeviceIP,
			passwordResetData.UserId, passwordResetData.NewPassword, passwordResetData.ConfirmPassword)
		logger.debug("[user_controller] :: resetPassword() : result : " + result);
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Reset_Password')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[user_controller] :: resetPassword() : error : " + error);
		if (error.message === 'Link not valid') {
			return res.status(403).json({
				status: {
					code: 403,
					name: i18n.__('Link_not_valid'),
					message: i18n.__('Link_not_valid')
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Reseting_Password')
				},
				payload: null
			});
		}
	}
}

// Handle forgot user name.
exports.requestUsername = async function (req, res) {
	try {
		const usernameRequestData = req.body;
		logger.trace("[user_controller] :: requestUsername() : usernameRequestData : start" + JSON.stringify(usernameRequestData));
		const result = await userService.requestUsername(usernameRequestData.Email, usernameRequestData.DeviceIP);
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Sent_Username')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[user_controller] :: requestUsername() : error : " + error);
		if (error.message == 'Account not verified') {
			return res.status(401).json({
				status: {
					code: 401,
					name: i18n.__('Error'),
					message: i18n.__('Account_Not_Verified')
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Sending_Username')
				},
				payload: null
			});
		}
	}
}

exports.validatePasswordResetLink = async function (req, res) {
	logger.debug("[user_controller] :: validatePasswordResetLink() : req : " + JSON.stringify(req.body));
	try {
		var reqId = req.params.reqId;
		var keyCode = req.params.keyCode
		const result = await userService.validatePasswordResetLink(reqId, keyCode)
		logger.debug("[user_controller] :: validatePasswordResetLink() : result : " + result);
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Reset_Password')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[user_controller] :: validatePasswordResetLink() : error : " + error);
		if (error.message === 'Link not valid') {
			return res.status(403).json({
				status: {
					code: 403,
					name: i18n.__('Link_not_valid'),
					message: i18n.__('Link_not_valid')
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Reseting_Password')
				},
				payload: null
			});
		}
	}
}

exports.addCityUser = async function (req, res) {
	logger.debug("[user_controller] :: addCityUser() Start");
	try {
		var user = await userService.addCityUser(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[user_controller] :: addCityUser() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Added_CityUser')
			},
			payload: user
		});
	} catch (error) {
		logger.error("[user_controller] :: addCityUser() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Saving_data')
			},
			payload: null
		});
	}
}

exports.updateCityUser = async function (req, res) {
	logger.debug("[user_controller] :: updateCityUser() Start");
	try {
		var user = await userService.updateCityUser(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[user_controller] :: updateCityUser() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_CityUser')
			},
			payload: user
		});
	} catch (error) {
		logger.error("[user_controller] :: updateCityUser() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_Cityuser')
			},
			payload: null
		});
	}
}

exports.resetVendorEmail = async function (req, res) {
	logger.debug("[user_controller] :: resetVendorEmail() Start");
	try {
		var user = await userService.resetVendorEmail(req.body, basicUtil.getTokenUserId(req));
		logger.debug("[user_controller] :: resetVendorEmail() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Updated_Email')
			},
			payload: user
		});
	} catch (error) {
		logger.error("[user_controller] :: resetVendorEmail() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Updating_Email')
			},
			payload: null
		});
	}
}

exports.getCityUsersWithRole = async function (req, res) {
	logger.debug("[user_controller] :: getCityUsersWithRole() Start");
	try {
		var users = await userService.getCityUsersWithRole(req.params.noOfItems);
		logger.debug("[user_controller] :: getCityUsersWithRole() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_User')
			},
			payload: users
		});
	} catch (error) {
		logger.error("[user_controller] :: getCityUsersWithRole() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Users')
			},
			payload: null
		});
	}
}

exports.getVendorsWithRole = async function (req, res) {
	logger.debug("[user_controller] :: getVendorsWithRole() Start");
	try {
		var users = await userService.getVendorsWithRole(req.params.noOfItems);
		logger.debug("[user_controller] :: getVendorsWithRole() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Vendor')
			},
			payload: users
		});
	} catch (error) {
		logger.error("[user_controller] :: getVendorsWithRole() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Vendor')
			},
			payload: null
		});
	}
}

exports.getUserWithRole = async function (req, res) {
	logger.debug("[user_controller] :: getUserWithRole() Start");
	try {
		var users = await userService.getUserWithRole(req.params.userId);
		logger.debug("[user_controller] :: getUserWithRole() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_User')
			},
			payload: users
		});
	} catch (error) {
		logger.error("[user_controller] :: getUserWithRole() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Users')
			},
			payload: null
		});
	}
}

exports.isUserNameExists = async function (req, res) {
	logger.debug("[user_controller] :: isUserNameExists() Start");
	try {
		var users = await userService.isUserNameExists(req.body);
		logger.debug("[user_controller] :: isUserNameExists() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_User')
			},
			payload: users
		});
	} catch (error) {
		logger.error("[user_controller] :: isUserNameExists() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Users')
			},
			payload: null
		});
	}
}

exports.getVendorByUserId = async function (req, res, next) {
	logger.debug("[user_controller] :: getVendorByUserId() Start");
	try {
		var userId = req.params.userId;
		var user = await userService.getVendorByUserId(userId);
		logger.debug("[user_controller] :: getVendorByUserId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Retrieving_Vendor')
			},
			payload: user
		});
	} catch (error) {
		logger.error("[user_controller] :: getVendorByUserId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Vendor')
			},
			payload: null
		});
	}
};

exports.getSearchResults = async function (req, res) {
	logger.debug("[user_controller] :: getSearchResults() Start");
	try {
		var result = await userService.getSearchResults(req.body, req.params.noOfItems);
		logger.debug("[user_controller] :: getSearchResults() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Search_Results')
			},
			payload: result
		});
	} catch (error) {
		logger.error("[user_controller] :: getSearchResults() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Search_Results')
			},
			payload: null
		});
	}
};

exports.getRoles = async function (req, res, next) {
	logger.debug("[user_controller] :: getRoles() Start");
	try {
		var roles = await userService.getRoles();
		logger.debug("[user_controller] :: getRoles() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Retrieving_Roles')
			},
			payload: roles
		});
	} catch (error) {
		logger.error("[user_controller] :: getRoles() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Roles')
			},
			payload: null
		});
	}
};

exports.getCityUserSearchResults = async function (req, res) {
	logger.debug("[user_controller] :: getCityUserSearchResults() Start");
	try {
		var roles = await userService.getCityUserSearchResults(req.body, req.params.noOfCityUsers);
		logger.debug("[user_controller] :: getCityUserSearchResults() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Retrieving_User_Serach_Results')
			},
			payload: roles
		});
	} catch (error) {
		logger.error("[user_controller] :: getCityUserSearchResults() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_User_Serach_Results')
			},
			payload: null
		});
	}
}

exports.getVendorSearchResults = async function (req, res) {
	logger.debug("[user_controller] :: getVendorSearchResults() Start");
	try {
		var roles = await userService.getVendorSearchResults(req.body, req.params.noOfVendors);
		logger.debug("[user_controller] :: getVendorSearchResults() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Retrieving_Vendor_Serach_Results')
			},
			payload: roles
		});
	} catch (error) {
		logger.error("[user_controller] :: getVendorSearchResults() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Vendor_Serach_Results')
			},
			payload: null
		});
	}
}

exports.getVendorDetails = async function (req, res) {
	logger.debug("[user_controller] :: getVendorDetails() Start");
	try {
		var roles = await userService.getVendorDetails(req.body.Id);
		logger.debug("[user_controller] :: getVendorDetails() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Get_Vendor_Details')
			},
			payload: roles
		});
	} catch (error) {
		logger.error("[user_controller] :: getVendorDetails() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Get_Vendor_Details')
			},
			payload: null
		});
	}
}

exports.updateVendorDetails = async function (req, res) {
	logger.debug("[user_controller] :: updateVendorDetails() Start");
	try {
		var roles = await userService.updateVendorDetails(req.body);
		logger.debug("[user_controller] :: updateVendorDetails() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Update_Vendor_Details')
			},
			payload: roles
		});
	} catch (error) {
		logger.error("[user_controller] :: updateVendorDetails() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Update_Vendor_Details')
			},
			payload: null
		});
	}
}

exports.getUserLoginInfoByUserId = async function (req, res) {
	logger.debug("[user_controller] :: getUserLoginInfoByUserId() Start");
	try {
		var roles = await userService.getUserLoginInfoByUserId(req.body.userId);
		logger.debug("[user_controller] :: getUserLoginInfoByUserId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Update_Vendor_Details')
			},
			payload: roles
		});
	} catch (error) {
		logger.error("[user_controller] :: getUserLoginInfoByUserId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Update_Vendor_Details')
			},
			payload: null
		});
	}
}

// Adding data on user launch / cancel tour guide 
exports.addUserAdditionalInfo = async function (req, res) {
	logger.debug("[user_controller] :: addUserAdditionalInfo() Start");
	try {
		var info = await userService.addUserAdditionalInfo(basicUtil.getTokenUserId(req), req.body.info);
		logger.debug("[user_controller] :: addUserAdditionalInfo() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Add_User_Additional_info')
			},
			payload: info
		});
	} catch (error) {
		logger.error("[user_controller] :: addUserAdditionalInfo() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Add_User_Additional_info')
			},
			payload: null
		});
	}
}

// To check if user has performed launch or cancel tour guide
exports.getUserAdditionalInfoByUserId = async function (req, res) {
	logger.debug("[user_controller] :: getUserAdditionalInfoByUserId() Start");
	try {
		var info = await userService.getUserAdditionalInfoByUserId(basicUtil.getTokenUserId(req));
		logger.debug("[user_controller] :: getUserAdditionalInfoByUserId() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Success_Get_User_additional_info')
			},
			payload: info
		});
	} catch (error) {
		logger.error("[user_controller] :: getUserAdditionalInfoByUserId() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Get_User_additional_info')
			},
			payload: null
		});
	}
}

// Manage subscribed users - get user emails
exports.getSubscribers = async function (req, res) {
	logger.debug("[user_controller] :: getSubscribers() Start");
	try {
		var info = await userService.getSubscribers(req.params.noOfSubscribers);
		logger.debug("[user_controller] :: getSubscribers() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Subscribers')
			},
			payload: info
		});
	} catch (error) {
		logger.error("[user_controller] :: getSubscribers() : error : " + error);
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Subscribers')
			},
			payload: null
		});
	}
}

// Manage subscribed users - search by user email
exports.getSubscriberSearchResults = async function (req, res) {
	logger.debug("[user_controller] :: getSubscriberSearchResults() Start");
	try {
		var info = await userService.getSubscriberSearchResults(req.params.noOfSubscribers, req.body.value);
		logger.debug("[user_controller] :: getSubscriberSearchResults() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Retrieved_Subscriber_Search_Results')
			},
			payload: info
		});
	} catch (error) {
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Retrieving_Subscriber_Search_Results')
			},
			payload: null
		});
	}
}

// Manage subscribed users - Enalbe/disable user emails 
exports.changeSubscriberStatus = async function (req, res) {
	logger.debug("[user_controller] :: changeSubscriberStatus() Start");
	try {
		var info = await userService.changeSubscriberStatus(req.body.Id, req.body.status, basicUtil.getTokenUserId(req));
		logger.debug("[user_controller] :: changeSubscriberStatus() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Changed_Subscriber_Status')
			},
			payload: info
		});
	} catch (error) {
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Changing_Subscriber_Status')
			},
			payload: null
		});
	}
}

//check if vendor is allowble to switch
exports.isVendorAllowedToSwitch = async function (req, res) {
	logger.debug("[user_controller] :: isVendorAllowedToSwitch() Start");
	try {
		var info = await userService.isVendorAllowedToSwitch(req.body.id, req.body.role);
		logger.debug("[user_controller] :: isVendorAllowedToSwitch() End");
		return res.status(200).json({
			status: {
				code: 200,
				name: i18n.__('Success'),
				message: i18n.__('Successfully_Get_Vendor_Switch_Status')
			},
			payload: info
		});
	} catch (error) {
		if (error.message.includes('error')) {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: error.message
				},
				payload: null
			});
		} else {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: i18n.__('Error_Getting_Vendor_Switch_Status')
				},
				payload: null
			});
		}
	}
}

// switch vendors
exports.switchVendor = async function (req, res) {
	logger.debug("[user_controller] :: switchVendor() Start");
	try {
		userService.switchVendor(req.body.userId, req.body.role, basicUtil.getTokenUserId(req)).then(() => {
			logger.debug("[user_controller] :: switchVendor() End");
			return res.status(200).json({
				status: {
					code: 200,
					name: i18n.__('Success'),
					message: i18n.__('Successfully_Switched_Vendor')
				},
				payload: true
			});
		}).catch((err) => {
			return res.status(500).json({
				status: {
					code: 500,
					name: i18n.__('Error'),
					message: err
				},
				payload: null
			});
		});
	} catch (error) {
		return res.status(500).json({
			status: {
				code: 500,
				name: i18n.__('Error'),
				message: i18n.__('Error_Switching_Vendor')
			},
			payload: null
		});
	}
}


