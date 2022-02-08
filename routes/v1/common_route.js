const express = require('express');
const router = express.Router();
const commonController = require("../../controllers/common_controller");
const auth = require("../../middleware/auth");
const verifyAdmin = require('../../middleware/verifyAdmin');

router.route('/getServerVersion').get(commonController.getServerVersion);
router.route('/getResourceTypes').get(auth, verifyAdmin, commonController.getResourceTypes);
router.route('/getMaintenanceData').get(commonController.getMaintenanceData)

module.exports = router;