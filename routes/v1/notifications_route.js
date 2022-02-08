const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const notificationController = require("../../controllers/notification_controller");

router.route('/addNotification').post(auth, notificationController.addNotification);
router.route('/getNotificationsByUserId/:initialLoadedNotifications').get(auth, notificationController.getNotificationsByUserId);
router.route('/getUserNotificationsByPriorityOrder').get(auth, notificationController.getUserNotificationsByPriorityOrder);
router.route('/updateNotificationStatusByUserId').post(auth, notificationController.updateNotificationStatusByUserId);
router.route('/markAllAsRead').post(auth, notificationController.markAllAsRead);

module.exports = router