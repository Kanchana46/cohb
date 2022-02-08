const express = require('express');
const router = express.Router();

const auth = require("../../middleware/auth")
const professionalVendorController = require("../../controllers/professional_vendor_controller")
const verifyAdmin = require('../../middleware/verifyAdmin');

router.route('/updatePSVendorByVendorId/').post(auth, professionalVendorController.updatePSVendorByVendorId);
router.route('/checkTaxIdAvailability/:inputValue/:id').get(auth, professionalVendorController.checkTaxIdAvailability);
router.route('/checkCertificationNoAvailability/:inputValue/:id').get(auth, professionalVendorController.checkCertificationNoAvailability);
router.route('/checkTxBoardOfProfAvailability/:inputValue/:id').get(auth, professionalVendorController.checkTxBoardOfProfAvailability);
router.route('/getPSVendorByUserId/:userId').get(auth, professionalVendorController.getPSVendorByUserId);
router.route('/getAllStates/').get(professionalVendorController.getAllStates);
router.route('/getFullTimePersonnel/').get(professionalVendorController.getFullTimePersonnel);
router.route('/getPSVendorProfileStatusByUserId/:userId').get(auth, professionalVendorController.getPSVendorProfileStatusByUserId);
router.route('/getResourceDocuments').get(professionalVendorController.getResourceDocuments);
router.route('/getPSVendorANDHPW100ByUserId/:userId').get(auth, verifyAdmin, professionalVendorController.getPSVendorANDHPW100ByUserId);
module.exports = router;