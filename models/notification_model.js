const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const util = require('../util/basicutil');

// Add notifications
exports.addNotification = async function (notification) {
    logger.debug("[notification_model] :: addNotification() : Start");
    const dbQuery = `INSERT INTO [user_notification] (id, userId, level, subject, body, sentTime)
                     VALUES (
                     '${notification.id}', '${notification.userId}','${notification.level}',
                     '${notification.subject}','${notification.body}','${notification.sentTime}'
                     )`;
    const result = await db.query(dbQuery);
    logger.trace("[notification_model] :: addNotification() : End");
    return result.rowsAffected;
}

// Get Notifications for given user id order by date
exports.getNotificationsByUserId = async function (userId, noOFNotifications) {
    logger.debug("[notification_model] :: getNotificationsByUserId() : Start");
    let dbQuery = `SELECT ${noOFNotifications != 'null' ? `TOP(${noOFNotifications})` : ``}* FROM [user_notification] WHERE [UserId] = '${userId}' ORDER BY [SentTime] DESC`
    const result = await db.query(dbQuery);
    logger.trace("[notification_model] :: getNotificationsByUserId() : End");
    return result.recordset;
}

// Get Notifications for given user id order by priority
exports.getUserNotificationsByPriorityOrder = async function (userId) {
    logger.debug("[notification_model] :: getUserNotificationsByPriorityOrder() : Start");
    const dbQuery = `SELECT * FROM [user_notification] WHERE [UserId] ='${userId}' AND [IsRead] IS NULL ORDER BY [Level] `;
    const result = await db.query(dbQuery);
    logger.trace("[notification_model] :: getUserNotificationsByPriorityOrder() : End");
    return result.recordset;
}

// Set relevant notifications to isRead
exports.updateNotificationStatusByUserId = async function (id, readTime) {
    logger.debug("[notification_model] :: updateNotificationStatusByUserId() : Start");
    const dbQuery = `UPDATE user_notification SET [IsRead] = '1', [ReadTime] = '${readTime}' 
                     WHERE [Id] = '${id}'`;
    const result = await db.query(dbQuery);
    logger.trace("[notification_model] :: updateNotificationStatusByUserId() : End");
    return result.rowsAffected;
}

// set all notifications as read for the user
exports.markAllAsRead = async function (userId, readTime) {
    logger.debug("[notification_model] :: markAllAsRead() : Start");
    const dbQuery = `UPDATE [user_notification] SET [IsRead] = '1', [ReadTime] = '${readTime}' 
                     WHERE [UserId] = '${userId}' AND ([IsRead] = '0' OR [IsRead] IS NULL)`;
    const result = await db.query(dbQuery);
    logger.trace("[notification_model] :: markAllAsRead() : End");
    return result.rowsAffected;
}


