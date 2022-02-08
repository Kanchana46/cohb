const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth")
const resourceController = require('../../controllers/resource_controller')
const upload = require('../../util/multer.config');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.route('/uploadFiles').post(auth, verifyAdmin, upload.array('file', 12), resourceController.docUpload);
router.route('/insertDocuments').post(auth, verifyAdmin, resourceController.insertResourceDoc);
router.route('/deleteResourceDocs').post(auth, verifyAdmin, resourceController.deleteResourceDocs);
router.route('/deleteResourceDoc').post(auth, verifyAdmin, resourceController.deleteResourceDoc);


module.exports = router;