const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const uuidv1 = require('uuid/v1');
const moment = require('moment')
const empty = require('is-empty');
const util = require('../util/basicutil');
const { getUserRoleIdByUserId } = require("./user_model");

exports.addLog = async function (role, resource, activity, vendorId, userId) {
	logger.debug("[log_model] :: addLog() : Start");
	let currentDate = moment();
	let roleId = await getUserRoleIdByUserId(userId);

	//CR#3 - Modified query to use the newly added columns Username, Company and VendorId
	var dbQuery = `INSERT INTO [activity_log] ([Id], [ActivityDate], [RoleId], [Resource], [Activity], [AddedBy], [VendorId], [Username], [Company]) 
					VALUES('${uuidv1()}', '${currentDate.utc().format('YYYY-MM-DD HH:mm:ss')}', '${roleId}', '${resource}', '${util.replaceQuotes(activity)}', '${userId}', '${vendorId}', 
					(SELECT Username FROM [user] WHERE Id = '${userId}'), (SELECT Company FROM [user] WHERE Id = '${userId}'))`;
	var result = await db.query(dbQuery);
	logger.debug("[log_model] :: addLog() : End");
	return result.recordset;
}

exports.getLogs = async function (noOfLogs, searchText, role, resource, startDate, endDate) {
	logger.debug("[log_model] :: getLogs() : Start");
	/*var dbQuery = `SELECT TOP ${noOfLogs} [activity_log].*,[role].Description AS Role, ` +
		`[construction_vendor].Vendor AS CSVendor, [professional_service_vendor].Vendor AS PSVendor, [user].UserName AS UserName FROM [activity_log] ` +
		`LEFT JOIN [construction_vendor] ON [construction_vendor].Id = [activity_log].VendorId ` +
		`LEFT JOIN [professional_service_vendor] ON [professional_service_vendor].Id = [activity_log].VendorId ` +
		`LEFT JOIN [user] ON [user].Id = [activity_log].AddedBy ` +
		`LEFT JOIN [role] ON [role].Id = [activity_log].RoleId `*/

	//CR#3 - Modified query to get both older and newly added logs without impact after adding new columns Username, Company and VendorId
	var dbQuery = `SELECT TOP ${noOfLogs} * FROM
					(SELECT [activity_log].[Id],
					[activity_log].[ActivityDate],
					[activity_log].[Resource],
					[activity_log].[Activity],
					[activity_log].[AddedBy],
					[activity_log].[VendorId],
					[activity_log].[RoleId],
					[role].Description AS Role,
					CASE 
						WHEN [construction_vendor].Vendor IS NULL THEN [professional_service_vendor].Vendor 
                        ELSE [construction_vendor].Vendor 
                    END as Company,
                    [user].UserName as Username
					FROM [activity_log]
					LEFT JOIN [construction_vendor] ON [construction_vendor].Id =[activity_log].AddedBy
					LEFT JOIN [professional_service_vendor] ON [professional_service_vendor].Id = [activity_log].AddedBy
					LEFT JOIN [user] ON [user].Id = [activity_log].AddedBy
					LEFT JOIN [role] ON [role].Id = [activity_log].RoleId WHERE [activity_log].Username IS NULL
					UNION
					SELECT [activity_log].[Id],
					[activity_log].[ActivityDate],
					[activity_log].[Resource],
					[activity_log].[Activity],
					[activity_log].[AddedBy],
					[activity_log].[VendorId],
					[activity_log].[RoleId],
					[role].Description AS Role,
					[activity_log].Company,
					[activity_log].Username
					FROM [activity_log]
					LEFT JOIN [construction_vendor] ON [construction_vendor].Id =[activity_log].VendorId
					LEFT JOIN [professional_service_vendor] ON [professional_service_vendor].Id = [activity_log].VendorId
					LEFT JOIN [user] ON [user].Id = [activity_log].AddedBy
					LEFT JOIN [role] ON [role].Id = [activity_log].RoleId WHERE [activity_log].Username IS NOT NULL) activity_log `

	if (!empty(searchText) || !empty(role) || !empty(resource) || !empty(startDate) || !empty(endDate)) {
		dbQuery += `WHERE `
		var whereClause = ''
		if (!empty(searchText)) {
			searchText = util.replaceQuotes(searchText)
			//whereClause += `([construction_vendor].Vendor LIKE '%${searchText}%' OR [professional_service_vendor].Vendor LIKE '%${searchText}%' OR [activity_log].Activity LIKE '%${searchText}%') `
			whereClause += `([activity_log].Company LIKE '%${searchText}%' OR  [activity_log].Username LIKE '%${searchText}%' OR [activity_log].Activity LIKE '%${searchText}%') `
		}
		if (!empty(role)) {
			if (!empty(whereClause)) {
				whereClause += ` AND `
			}
			whereClause += `[activity_log].RoleId = '${role}' `
		}
		if (!empty(resource)) {
			if (!empty(whereClause)) {
				whereClause += ` AND `
			}
			whereClause += `[activity_log].Resource = '${resource}' `
		}
		if (!empty(startDate) && !empty(endDate) && (startDate === endDate)) {
			let tempStartDate = moment(startDate).format('YYYY-MM-DD 00:00')
			let tempEndDate = moment(endDate).format('YYYY-MM-DD 23:59')
			if (!empty(whereClause)) {
				whereClause += ` AND `
			}
			whereClause += `[activity_log].ActivityDate >= CAST('${tempStartDate}' AS DATETIME) AND [activity_log].ActivityDate <= CAST('${tempEndDate}' AS DATETIME) `
		} else {
			if (!empty(startDate)) {
				let tempStartDate = moment(startDate).format('YYYY-MM-DD HH:mm')
				//let tempStartDate = moment(new Date(new Date(startDate).getUTCFullYear(), new Date(startDate).getUTCMonth(), new Date(startDate).getUTCDate())).utc().format('YYYY-MM-DD HH:mm')
				if (!empty(whereClause)) {
					whereClause += ` AND `
				}
				whereClause += `CAST([activity_log].ActivityDate AS DATE) >= CAST('${tempStartDate}' AS DATE) `
			}
			if (!empty(endDate)) {
				let tempEndDate = moment(endDate).format('YYYY-MM-DD HH:mm')
				//let tempEndDate = moment(new Date(new Date(endDate).getUTCFullYear(), new Date(endDate).getUTCMonth(), new Date(endDate).getUTCDate() + 1)).utc().format('YYYY-MM-DD HH:mm')
				if (!empty(whereClause)) {
					whereClause += ` AND `
				}
				whereClause += `CAST([activity_log].ActivityDate AS DATE) <= CAST('${tempEndDate}' AS DATE) `
			}
		}
		dbQuery += whereClause
	}
	dbQuery += `ORDER BY [activity_log].ActivityDate DESC`
	var result = await db.query(dbQuery);
	logger.debug("[log_model] :: getLogs() : End");
	return result.recordset;
}