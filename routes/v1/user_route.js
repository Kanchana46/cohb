const express = require('express');
const router = express.Router();

const auth = require("../../middleware/auth")
const userController = require("../../controllers/user_controller");
const verifyAdmin = require('../../middleware/verifyAdmin');
const verifySuperAdmin = require('../../middleware/verifySuperAdmin');


//router.route('/').get(auth, userController.getAllUsers);
router.route('/').get(auth, userController.getAllUsers);
router.route('/login').post(userController.loginUser);
router.route('/refreshtoken').post(userController.refreshToken)
router.route('/subscribeUser/').post(userController.subscribeUser);
router.route('/unsubscribe/').post(userController.unsubscribe);
router.route('/registerVendor/').post(userController.registerVendor);
router.route('/checkUsernameAvailability/:inputValue').get(userController.checkUsernameAvailability);
router.route('/checkEmailAvailability/:inputValue').get(userController.checkEmailAvailability);
router.route('/checkTaxIdAvailability/:inputValue').get(userController.checkTaxIdAvailability);
router.route('/checkPasswordAvailability/:password/:userId/:reqId').get(userController.checkPasswordAvailability);
router.route('/requestPWReset').post(userController.requestPasswordReset);
router.route('/resetPassword').post(userController.resetPassword);
router.route('/requestUsername').post(userController.requestUsername);
router.route('/validatePasswordResetLink/:reqId/:keyCode').get(userController.validatePasswordResetLink);
router.route('/getCityUsersWithRole/:noOfItems').get(auth, verifyAdmin, userController.getCityUsersWithRole);
router.route('/getVendorsWithRole/:noOfItems').get(auth, verifyAdmin, userController.getVendorsWithRole);
router.route('/addCityUser').post(auth, verifyAdmin, userController.addCityUser);
router.route('/editCityUser').post(auth, verifyAdmin, userController.updateCityUser);
router.route('/resetVendorEmail').post(auth, verifyAdmin, userController.resetVendorEmail);
router.route('/getUserWithRole/:userId').get(auth, userController.getUserWithRole);
router.route('/isUserNameExists').post(auth, userController.isUserNameExists);
router.route('/getVendorByUserId/:userId').get(auth, userController.getVendorByUserId);
router.route('/getSearchResults/:noOfItems').post(auth, verifyAdmin, userController.getSearchResults);
router.route('/getUserRoles/').get(auth, verifyAdmin, userController.getRoles);
router.route('/getCityUserSearchResults/:noOfCityUsers').post(auth, verifyAdmin, userController.getCityUserSearchResults);
router.route('/getVendorSearchResults/:noOfVendors').post(auth, verifyAdmin, userController.getVendorSearchResults);
router.route('/getVendorDetails').post(auth, verifyAdmin, userController.getVendorDetails);
router.route('/updateVendorDetails').post(auth, verifyAdmin, userController.updateVendorDetails);
router.route('/getUserLoginInfoByUserId').post(auth, userController.getUserLoginInfoByUserId);
router.route('/addUserAdditionalInfo').post(auth, userController.addUserAdditionalInfo);
router.route('/getUserAdditionalInfoByUserId').get(auth, userController.getUserAdditionalInfoByUserId);
router.route('/getSubscribers/:noOfSubscribers').get(auth, verifyAdmin, userController.getSubscribers);
router.route('/getSubscriberSearchResults/:noOfSubscribers').post(auth, verifyAdmin, userController.getSubscriberSearchResults);
router.route('/changeSubscriberStatus').post(auth, verifyAdmin, userController.changeSubscriberStatus);
router.route('/isVendorAllowedToSwitch').post(auth, verifySuperAdmin, userController.isVendorAllowedToSwitch);
router.route('/switchVendor').post(auth, verifySuperAdmin, userController.switchVendor);

//this should be the last one, if not this will execute wrong ones like /getUserRoles
router.route('/:id').get(auth, userController.getUserById);

module.exports = router;