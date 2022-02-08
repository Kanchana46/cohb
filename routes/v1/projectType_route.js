const express = require('express');
const router = express.Router();

const auth = require("../../middleware/auth")
const verifyAdmin = require("../../middleware/verifyAdmin")
const projectTypeController = require("../../controllers/project_type_controller")

router.route('/saveProjectType/').post(auth,projectTypeController.saveProjectType);
router.route('/getAllProjectTypes/').get( projectTypeController.getAllProjectTypes);
router.route('/getProjectTypesByStatus/:status').get( projectTypeController.getProjectTypesByStatus);
router.route('/updateProjectTypeStatusById').post(auth,projectTypeController.updateProjectTypeStatusById);
router.route('/updateProjectTypeById/').post(auth,projectTypeController.updateProjectTypeById);
router.route('/checkProjectTypeAvailability/:inputValue').get(auth,projectTypeController.checkProjectTypeAvailability);

module.exports = router;