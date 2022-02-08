const express = require('express')
const router = express.Router()

const indexController = require("../../controllers/index")
const userRoutes = require("./user_route");
const projectTypeRoutes = require("./projectType_route");
const professionalVendorRoutes = require("./professionalVendor_route");
const RFQsRoutes = require("./RFQ_route")
const resourceRoutes = require("./resource_route")
const commonRoutes = require("./common_route");
const constructionVendorRoutes = require('./constructionVendor_route')
const soqRoutes = require('./SOQ_route');
const cpRoutes = require('./construction_prequalification_route')
const HPW100Routes = require('./HPW100_route');
const logsRoutes = require('./logs_route')
const notificationsRoutes = require('./notifications_route');

router.get('/', indexController)
router.use('/users', userRoutes)
router.use('/projectTypes', projectTypeRoutes)
router.use('/professionalVendor', professionalVendorRoutes)
router.use('/rfqs', RFQsRoutes)
router.use('/resource', resourceRoutes)
router.use('/common', commonRoutes)
router.use('/constructionVendor', constructionVendorRoutes)
router.use('/soq', soqRoutes)
router.use('/constructionprequalification', cpRoutes)
router.use('/HPW100', HPW100Routes)
router.use('/logs', logsRoutes)
router.use('/notifications', notificationsRoutes)

module.exports = router