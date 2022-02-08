const nodemailer = require('nodemailer');
const logger = require('../util/log4jsutil');
var config = require('config')
var path = require('path')
var fs = require('fs');


exports.sendMail = async function (mailOptions) {
    logger.debug("[MailUtil] :: sendMail()");
    try {
        const file = fs.readFileSync(path.join(__dirname, config.get('emailTempPath')).split("\\").join("/"));
        const transporter = nodemailer.createTransport({
            host: config.get('EmailConfig.EmailHost'),
            port: config.get('EmailConfig.EmailPort'),
            secure: false, // use SSL
            auth: {
                user: config.get('EmailConfig.EmailAuthUser'),
                pass: config.get('EmailConfig.EmailAuthUserPassword'),
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        let message = {
            from: config.get('EmailConfig.FromEmail'),
            to: mailOptions.to,
            bcc: mailOptions.bcc,
            subject: mailOptions.subject,
            //html: mailOptions.html,
            html: String(file).replace("email_content", mailOptions.html).replace("current_year", new Date().getFullYear()),
            // replace("unsubscribe_user", `${process.env.CLIENT_URL}/unsubscribe?email=${mailOptions.to}`),
            attachments: mailOptions.attachments
        };

        const mailSent = await transporter.sendMail(message);
        logger.debug("[MailUtil] :: mailSent() : " + mailSent);
        return true;
    } catch (error) {
        logger.error("[MailUtil] :: sendMail() : err : " + error);
        return true;
    }
}