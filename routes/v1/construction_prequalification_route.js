const express = require('express');
const router = express.Router();
let upload = require('../../util/multer.config');

const auth = require("../../middleware/auth");
const verifyAdmin = require('../../middleware/verifyAdmin');
const verifyCSAdmin = require("../../middleware/verifyConstructionAdmin");
const cpController = require("../../controllers/construction_prequalification_controller");

router.route('/getCPVendors/:status/:noOfCPs').get(auth, verifyCSAdmin, cpController.getCPVendors);
router.route('/updateCPstatus').post(auth, verifyAdmin, cpController.updateCPstatus);
//router.route('/uploadFinancialForm').post(cpController.uploadFinancialForm);
//router.route('/getCSResourceDocByName').post(cpController.getCSResourceDocByName);
router.route('/downloadCPFiles').post(auth, cpController.downloadCPFiles)
router.route('/updateCPDocumentData').post(auth, upload.array('file', 10), cpController.updateCPDocumentData);
router.route('/getCPDataByVendorId').post(auth, cpController.getCPDataByVendorId);
router.route('/getCPDocAndCategory').get(auth, cpController.getCPDocAndCategory);
router.route('/updateConstructionPrequalification').post(auth, cpController.updateConstructionPrequalification);
router.route('/getSearchResults/:status/:noOfCPs').post(auth, cpController.getSearchResults);
router.route('/setCPStatus').post(auth, cpController.setCPStatus);
router.route('/getCpDataByCategoryAndCPId').post(auth, cpController.getCpDataByCategoryAndCPId);
router.route('/addConstructionPrequalification').post(auth, cpController.addConstructionPrequalification);
router.route('/saveCheckListData').post(verifyCSAdmin, cpController.saveCheckListData);
router.route('/getCheckListByCPId').post(verifyCSAdmin, cpController.getCheckListByCPId);

module.exports = router;