const express = require('express');
const router = express.Router();
let upload = require('../../util/multer.config');
const auth = require("../../middleware/auth");
const soqController = require("../../controllers/SOQ_controller");
const verifyAdmin = require('../../middleware/verifyAdmin');
const verifyCity = require("../../middleware/verifyCity");

router.route('/getSOQByRFQId').post(auth, verifyCity, soqController.getSOQByRFQId);
router.route('/getSOQByRFQAndVendor/:rfqId/:vendorId').get(auth, soqController.getSOQByRFQAndVendor);
router.route('/getHPW100sByVendorId/:vendorId').get(auth, soqController.getHPW100sByVendorId);
router.route('/getPSSubVendors/:vendorId').get(auth, soqController.getPSSubVendors);
router.route('/saveSOQDetails').post(auth, soqController.saveSOQDetails);
router.route('/uploadSOQ').post(auth, upload.single('file'), soqController.uploadSOQ);
router.route('/submitSOQ').post(auth, soqController.submitSOQ);
router.route('/downloadSOQ').post(auth, soqController.downloadSOQ)
router.route('/downloadGeneratedSOQ').post(auth, soqController.downloadGeneratedSOQ)
router.route('/getGeneratedSOQDocDetails/:soqId').get(auth, soqController.getGeneratedSOQDocDetails)
router.route('/getSubmissionData').post(auth, soqController.getSubmissionData);
router.route('/downloadALl').post(auth, verifyAdmin, soqController.downloadAll);
router.route('/getAllSubmissionData').post(auth, verifyCity, soqController.getAllSubmissionData);
router.route('/downloadAllSubmissions/:downloadOption').post(auth, verifyAdmin, soqController.downloadAllSubmissions);
//router.route('/addDownloadAllSubmissionsLog').post(auth, verifyAdmin, soqController.addDownloadAllSubmissionsLog);

module.exports = router;