const empty = require('is-empty');
const jwt = require("jsonwebtoken");
const config = require("config");
const userModel = require("../models/user_model")
const logger = require('../util/log4jsutil');

module.exports = async function (req, res, next) {

    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middelware)
    if (!token) return res.status(401).json({
        status: {
            code: 401,
            name: "Unauthorized",
            message: "Unauthorized"
        },
        payload: null
    });

    const decodedToken = await jwt.verify(token, config.get("privatekey"))
    let userId = decodedToken.data.id
    const result = await userModel.getUserRolesByUserId(userId)
    //unauthorized if no role information is present
    if (empty(result)) {
        res.status(401).json({
            status: {
                code: 401,
                name: "Unauthorized",
                message: "Unauthorized"
            },
            payload: null
        });
    } else {
        if (!empty(result) && (result[0].Description.toLowerCase() == 'super admin' || result[0].Description.toLowerCase() == 'admin' || result[0].Description.toLowerCase() == 'coh')) {
            //proceed if admin or RO user
            next()
        } else {
            logger.error("[verifyCity] :: error : Unauthorized");
            res.status(401).json({
                status: {
                    code: 401,
                    name: "Unauthorized",
                    message: "Unauthorized"
                },
                payload: null
            });
        }
    }

};