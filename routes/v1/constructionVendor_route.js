const express = require('express');
const router = express.Router();

const auth = require("../../middleware/auth");
const constructionVendorController = require("../../controllers/construction_vendor_controller");

router.route('/getResourceDocuments').get(constructionVendorController.getResourceDocuments);
router.route('/getCSVendorInfo/:userId').get(auth, constructionVendorController.getCSVendorInfo);
router.route('/checkCertificationNoAvailability/:inputValue/:id').get(constructionVendorController.checkCertificationNoAvailability);
router.route('/updateCSVendorByVendorId').post(auth, constructionVendorController.saveVendorProfileData);
router.route('/updateAccMnagerDataByVendorId').post(auth, constructionVendorController.saveAccountManagerData);
router.route('/getCSVendorInfoAndCPDoc/:userId/:cpId').get(auth, constructionVendorController.getCSVendorInfoAndCPDoc)

module.exports = router;