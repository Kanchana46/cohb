const uuidv1 = require('uuid/v1');
const logger = require('../util/log4jsutil');
const notificationModel = require('../models/notification_model');

// Add notifications
exports.addNotification = async function () {
    logger.debug("[notification_service] :: addNotification() : Start");
    const addNotification = await notificationModel.addNotification();
    logger.debug("[notification_service] :: addNotification() : End");
    return addNotification;
}

// Get Notifications for given user id
exports.getNotificationsByUserId = async function (userId, noOFNotifications) {
    logger.debug("[notification_service] :: getNotificationsByUserId() : Start");
    const getNotifications = await notificationModel.getNotificationsByUserId(userId, noOFNotifications);
    logger.debug("[notification_service] :: getNotificationsByUserId() : End");
    return getNotifications;
}

// Get Notifications for given user id order by priority
exports.getUserNotificationsByPriorityOrder = async function (userId) {
    logger.debug("[notification_service] :: getUserNotificationsByPriorityOrder() : Start");
    const getNotifications = await notificationModel.getUserNotificationsByPriorityOrder(userId);
    logger.debug("[notification_service] :: getUserNotificationsByPriorityOrder() : End");
    return getNotifications;
}

// Set relevant notifications to isRead
exports.updateNotificationStatusByUserId = async function (notification) {
    logger.debug("[notification_service] :: updateNotificationStatusByUserId() : Start");
    const updateNotification = await notificationModel.updateNotificationStatusByUserId(notification.id, notification.readTime);
    logger.debug("[notification_service] :: updateNotificationStatusByUserId() : End");
    return updateNotification;
}

// set all notifications as read for the user
exports.markAllAsRead = async function (userId, readTime) {
    logger.debug("[notification_service] :: markAllAsRead() : Start");
    const updateNotification = await notificationModel.markAllAsRead(userId, readTime);
    logger.debug("[notification_service] :: markAllAsRead() : End");
    return updateNotification;
}