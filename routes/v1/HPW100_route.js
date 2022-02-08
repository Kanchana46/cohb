const express = require('express');
const router = express.Router();

const auth = require("../../middleware/auth")
const HPW100Controller = require("../../controllers/HPW100_controller")

router.route('/').post(auth, HPW100Controller.addHPW100);
router.route('/:hpw100Id').put(auth, HPW100Controller.updateHPW100);
router.route('/getCompanyTypes').get(auth, HPW100Controller.getCompanyTypes);
router.route('/all/:vendorId').get(auth, HPW100Controller.getHPW100ByVendorId);
router.route('/getProjectTypesByVendorHPWs/:vendorId').get(auth, HPW100Controller.getProjectTypesByVendorHPWs);
router.route('/getWorkExperiencesByHPW100Id/:hpw100Id').get(auth, HPW100Controller.getWorkExperiencesByHPW100Id);
router.route('/downloadHpw100').post(auth, HPW100Controller.downloadHpw100);

module.exports = router;