const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth")
const rfqController = require("../../controllers/RFQ_controller")
let upload = require('../../util/multer.config');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.route('/uploadFiles').post(auth, verifyAdmin, upload.array('files', 32), rfqController.docUpload);
router.route('/insertRFQData/:status').post(auth, verifyAdmin, rfqController.insertRFQ);
router.route('/deleteRFQ').post(auth, verifyAdmin, rfqController.deleteRFQ);
router.route('/isActiveProjectType').post(auth, verifyAdmin, rfqController.isActiveProjectType);
router.route('/notifyUser').post(auth, verifyAdmin, rfqController.notifyUser);
router.route('/getRFQData/:noOfRfqs').get(rfqController.getRFQData);
router.route('/getLettersOfClarification/:rfq').get(rfqController.getLettersOfClarification);
router.route('/getRFQProjectType/:rfq').get(rfqController.getRFQProjectType);
router.route('/getRFQSearchResults/:noOfRfqs').post(rfqController.getSearchResults);
router.route('/download').post(rfqController.download)
router.route('/getSOQStatus/:vendorId').get(auth, rfqController.getSOQStatus)
router.route('/getRFQDetailsByRFQId/:rfqId').get(auth, rfqController.getRFQDetailsByRFQId)
router.route('/getMatchingHPW100sByRFQ/:rfqId/:vendorId').get(auth, rfqController.getMatchingHPW100sByRFQ)
router.route('/getRFQByTitle').post(auth, rfqController.getRFQByTitle)
router.route('/closeRFQ').get(auth, verifyAdmin, rfqController.closeRFQ);
router.route('/getNoOfActiveRFQs').get(rfqController.getNoOfActiveRFQs);
router.route('/getRFQsForExistingLCs').post(auth, verifyAdmin, rfqController.getRFQsForExistingLCs);

module.exports = router;