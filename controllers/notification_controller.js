const i18n = require("i18n");
const logger = require('../util/log4jsutil');
const notificationService = require("../services/notification_service");
const basicUtil = require('../util/basicutil');

//Add notification 
exports.addNotification = async function (req, res) {
    logger.debug("[notification_controller] :: addNotification() Start");
    try {
        const data = await notificationService.addNotification();
        logger.debug("[user_controller] :: addNotification() End");
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Added_Notification')
            },
            payload: data
        });
    } catch (error) {
        logger.error("[notification_controller] :: addNotification() : error : " + error);
        return res.status(500).json({
            status: {
                code: 500,
                name: i18n.__('Error'),
                message: i18n.__('Error_Adding_Notification')
            },
            payload: null
        });
    }
}

// Get Notifications for given user id
exports.getNotificationsByUserId = async function (req, res) {
    logger.debug("[notification_controller] :: getNotificationsByUserId() Start");
    try {
        const data = await notificationService.getNotificationsByUserId(basicUtil.getTokenUserId(req), req.params.initialLoadedNotifications);
        logger.debug("[user_controller] :: getNotificationsByUserId() End");
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Retrieved_Notifications')
            },
            payload: data
        });
    } catch (error) {
        logger.error("[notification_controller] :: getNotificationsByUserId() : error : " + error);
        return res.status(500).json({
            status: {
                code: 500,
                name: i18n.__('Error'),
                message: i18n.__('Error_Retrieving_Notifications')
            },
            payload: null
        });
    }
}

// Get Notifications for given user id order by priority
exports.getUserNotificationsByPriorityOrder = async function (req, res) {
    logger.debug("[notification_controller] :: getUserNotificationsByPriorityOrder() Start");
    try {
        const data = await notificationService.getUserNotificationsByPriorityOrder(basicUtil.getTokenUserId(req));
        logger.debug("[user_controller] :: getUserNotificationsByPriorityOrder() End");
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Retrieved_Notifications')
            },
            payload: data
        });
    } catch (error) {
        logger.error("[notification_controller] :: getUserNotificationsByPriorityOrder() : error : " + error);
        return res.status(500).json({
            status: {
                code: 500,
                name: i18n.__('Error'),
                message: i18n.__('Error_Retrieving_Notifications')
            },
            payload: null
        });
    }
}

// Set relevant notifications to isRead
exports.updateNotificationStatusByUserId = async function (req, res) {
    logger.debug("[notification_controller] :: updateNotificationStatusByUserId() Start");
    try {
        const data = await notificationService.updateNotificationStatusByUserId(req.body);
        logger.debug("[user_controller] :: updateNotificationStatusByUserId() End");
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Updated_Notification_Status')
            },
            payload: data
        });
    } catch (error) {
        logger.error("[notification_controller] :: updateNotificationStatusByUserId() : error : " + error);
        return res.status(500).json({
            status: {
                code: 500,
                name: i18n.__('Error'),
                message: i18n.__('Error_Updating_Notification_Status')
            },
            payload: null
        });
    }
}

// set all notifications as read for the user 
exports.markAllAsRead = async function (req, res) {
    logger.debug("[notification_controller] :: markAllAsRead() Start");
    try {
        const data = await notificationService.markAllAsRead(basicUtil.getTokenUserId(req), req.body.readTime);
        logger.debug("[user_controller] :: markAllAsRead() End");
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Marked_Notifications_As_Read')
            },
            payload: data
        });
    } catch (error) {
        logger.error("[notification_controller] :: markAllAsRead() : error : " + error);
        return res.status(500).json({
            status: {
                code: 500,
                name: i18n.__('Error'),
                message: i18n.__('Error_Marking_Notifications_As_Read')
            },
            payload: null
        });
    }
}