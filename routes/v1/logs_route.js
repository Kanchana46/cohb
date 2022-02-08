const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const logsController = require("../../controllers/logs_controller");
const verifyAdmin = require('../../middleware/verifyAdmin');

router.route('/').get(auth, verifyAdmin, logsController.getLogs);

module.exports = router;