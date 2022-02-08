const db = require("../db/dbconnection");
const logger = require('../util/log4jsutil');
const uuidv1 = require('uuid/v1');
var bcrypt = require('bcryptjs');
const util = require('../util/basicutil')
const sql = require("mssql");
const async = require("async");
require('events').EventEmitter.prototype._maxListeners = 100;

exports.loginUser = async function (userName) {
    logger.debug("[user_model] :: loginUser() : Start");
    var dbQuery = "SELECT * FROM [user] WHERE UserName= '" + util.replaceQuotes(userName) + "' AND Status=  " + 1;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: loginUser() : End");
    return result.recordset;
};
exports.getUserRolesByUserId = async function (userId) {
    logger.debug("[user_model] :: loginUser() : Start");
    var dbQuery = "SELECT [role].[Description] FROM [role]" +
        " LEFT JOIN [user_role] ON [role].Id = [user_role].RoleId" +
        " WHERE [user_role].UserId = '" + userId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: loginUser() : End");
    return result.recordset;
};

exports.getAllUsers = async function () {
    logger.debug("[user_model] :: getAllUsers() : Start");
    var dbQuery = 'SELECT * FROM [user]'
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getAllUsers() : End");
    return result.recordset;
}

exports.getUserById = async function (id) {
    logger.debug("[user_model] :: getUserById() : Start");
    var dbQuery = "SELECT * FROM [user] WHERE Id= '" + id + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUserById() : End");
    return result.recordset;
}

exports.getUserByEmail = async function (userName, email) {
    logger.debug("[user_model] :: getUserByEmail() : Start");
    var dbQuery = "SELECT * FROM [user] WHERE UserName= '" + userName + "' AND Email= '" + email + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUserByEmail() : End");
    return result.recordset;
}

exports.resetPassword = async function (userId, newPwd, expiryTime) {
    logger.debug("[user_model] :: resetPassword() : Start");
    var dbQuery = "UPDATE [user] SET Password= '" + newPwd + "', PasswordExpiryTime= '" + expiryTime + "' WHERE Id= '" + userId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: resetPassword() : End");
    return result.recordset;
}

// add new subscribers.
exports.subscribeUser = async function (subscriber) {
    logger.debug("[user_model] :: subscribeUser() : Start");
    var Id = uuidv1();
    /* var dbQuery = "INSERT INTO subscribe_user (Id, Name, CompanyName, Email, Status)" +
      "VALUES ('" + Id + "', '" + subscriber.name + "', '" + subscriber.company + "', '" + subscriber.email + "', '" + 1 + "');";*/
    // Change under CR#13
    var dbQuery = `IF EXISTS (SELECT Id FROM [subscribe_user] WHERE Email = '${subscriber.email}' AND Status = '0')  
                        UPDATE [subscribe_user] SET
                        Status = '1', Name = '${subscriber.name}', CompanyName = '${subscriber.company}' 
                        WHERE Email='${subscriber.email}'
                   ELSE
                        INSERT INTO [subscribe_user] (Id, Name, CompanyName, Email, Status) 
                        VALUES ('${Id}', '${subscriber.name}', '${subscriber.company}', '${subscriber.email}', 1 )`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: subscribeUser() : End");
    return result.rowsAffected;
}

// Unsubscribe users from RFQ updates.
exports.unsubscribe = async function (email) {
    logger.debug("[user_model] :: unsubscribe() : Start");
    //var dbQuery = "DELETE FROM subscribe_user WHERE Email = '" + email + "';";
    var dbQuery = `UPDATE subscribe_user SET Status = '0' WHERE Email = '${email}'` // Change under CR#13
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: unsubscribe() : End");
    return result.rowsAffected;
}

exports.getAllSubscribeUser = async function () {
    logger.debug("[user_model] :: getAllSubscribeUser() : Start");
    var dbQuery = "SELECT * FROM [subscribe_user] WHERE Status = 1"
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getAllSubscribeUser() : End");
    return result.recordset;
}

// Insert PS, CS vendors' user accounts.
exports.saveUser = async function (user) {
    logger.debug("[user_model] :: saveUser() : Start");
    var Id = uuidv1()
    user.company = user.company.replace("'", "''")
    var dbQuery = "INSERT INTO [dbo].[user] ([Id], [UserName], [Email], [Password], [Phone], [Status], [Company], [PasswordExpiryTime], [TaxId])" +
        "VALUES ('" + Id +
        "', '" + user.userName +
        "', '" + user.emailAddress +
        "', '" + user.Password +
        "', '" + user.phoneNo +
        "', " + user.status +
        ", '" + user.company +
        "', '" + user.passwordExpiryTime +
        "', '" + user.taxId +
        "');";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: saveUser() : End");
    if (result.rowsAffected == 1) {
        return Id;
    } else {
        return null;
    }

}

// Save PS, CS vendor roles in user_role tables.
exports.saveUserRole = async function (roleId, userId) {
    logger.debug("[user_model] :: saveUserRole() : Start");
    var Id = uuidv1()
    var dbQuery = "INSERT INTO [dbo].[user_role] ([Id], [UserId], [RoleId])" +
        "VALUES ('" + Id +
        "', '" + userId +
        "', '" + roleId +
        "');";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: saveUserRole() : End");
    return result.recordset;
}

// Save password of newly created vendor in password history table : user_old_password.
exports.saveUserOldPassword = async function (userId, currentTime, password) {
    logger.debug("[user_model] :: saveUserOldPassword() : Start");
    var Id = uuidv1()
    var dbQuery = "INSERT INTO [dbo].[user_old_password] ([Id], [UserId], [PasswordTime], [password])" +
        "VALUES ('" + Id +
        "', '" + userId +
        "', '" + currentTime +
        "', '" + password +
        "');";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: saveUserOldPassword() : End");
    return result.recordset;
}

// Insert professional service vendor.
exports.saveProfessionalVendor = async function (vendor, userId) {
    logger.debug("[user_model] :: saveProfessionalVendor() : Start");
    var Id = uuidv1()
    var dbQuery = "INSERT INTO [dbo].[professional_service_vendor] ([Id], [UserId], [Vendor], [Mailing], [Phone])" +
        "VALUES ('" + Id +
        "', '" + userId +
        "', '" + vendor.company +
        "', '" + vendor.emailAddress +
        "', '" + vendor.phoneNo +
        "');";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: saveProfessionalVendor() : End");
    return result.recordset;
}

// Insert construction vendor.
exports.saveConstructionVendor = async function (vendor, userId) {
    logger.debug("[user_model] :: saveConstructionVendor() : Start");
    var Id = uuidv1()
    var dbQuery = "INSERT INTO [dbo].[construction_vendor] ([Id], [UserId], [Status], [Vendor], [Email], [Phone])" +
        "VALUES ('" + Id +
        "', '" + userId +
        "', " + vendor.status +
        ", '" + vendor.company +
        "', '" + vendor.emailAddress +
        "', '" + vendor.phoneNo +
        "');";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: saveConstructionVendor() : End");
    return result.recordset;
}

// Check whether the username already exists.
exports.checkUsernameAvailability = async function (inputValue) {
    logger.debug("[user_model] :: checkUsernameAvailability() : Start");
    var dbQuery = 'SELECT "usernameAvailable" = CASE WHEN NumberofUsers = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofUsers FROM (SELECT [Id] FROM [User] WHERE UserName= \'' + inputValue + '\') AS y) AS x';
    var result = await db.query(dbQuery, [inputValue]);
    logger.trace("[user_model] :: checkUsernameAvailability() : End");
    return result.recordset;
};

// Check whether the email already exists.
exports.checkEmailAvailability = async function (inputValue) {
    logger.debug("[user_model] :: checkEmailAvailability() : Start");
    var dbQuery = 'SELECT "emailAvailable" = CASE WHEN NumberofUsers = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofUsers FROM (SELECT [Id] FROM [User] WHERE Email= \'' + inputValue + '\') AS y) AS x';
    var result = await db.query(dbQuery, [inputValue]);
    logger.trace("[user_model] :: checkEmailAvailability() : End");
    return result.recordset;
}

// Check whether the subscriber email already exists.
exports.checkSubscriptionEmailAvailability = async function (inputValue) {
    logger.debug("[user_model] :: checkEmailAvailability() : Start");
    var dbQuery = 'SELECT "emailAvailable" = CASE WHEN NumberofUsers = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofUsers FROM (SELECT [Id] FROM [subscribe_user] WHERE Status = 1 AND Email= \'' + inputValue + '\') AS y) AS x';
    var result = await db.query(dbQuery, [inputValue]);
    logger.trace("[user_model] :: checkEmailAvailability() : End");
    return result.recordset;
}

// Check whether the tax id already exists.
exports.checkTaxIdAvailability = async function (inputValue) {
    logger.debug("[user_model] :: checkTaxIdAvailability() : Start");
    var dbQuery = 'SELECT "taxIdAvailable" = CASE WHEN NumberofUsers = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofUsers FROM (SELECT [Id] FROM [User] WHERE TaxId= \'' + inputValue + '\') AS y) AS x';
    var result = await db.query(dbQuery, [inputValue]);
    logger.trace("[user_model] :: checkTaxIdAvailability() : End");
    return result.recordset;
}

exports.checkPasswordAvailability = async function (userId, count) {
    logger.debug("[user_model] :: checkPasswordAvailability() : Start");
    var dbQuery = "SELECT TOP (" + count + ") password FROM [user_old_password]" +
        " WHERE UserId = '" + userId + "' ORDER BY PasswordTime DESC"
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: checkPasswordAvailability() : End");
    return result.recordset;
}

// Get user role id.
exports.getUserRolebyDescription = async function (roleDescription) {
    logger.debug("[user_model] :: getUserRolebyDescription() : Start");
    var dbQuery = "SELECT Id from role where Description ='" + roleDescription + "'";
    var result = await db.query(dbQuery, [roleDescription]);
    logger.trace("[user_model] :: getUserRolebyDescription() : End");
    return result.recordset;
}

// Get user name for given email
exports.getUsernameByEmail = async function (email) {
    logger.debug("[user_model] :: getUsernameByEmail() : Start");
    var dbQuery = "SELECT UserName FROM [user] WHERE Email= '" + email + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUsernameByEmail() : End");
    return result.recordset;
}

exports.addCityUser = async function (cityUser) {
    logger.debug("[user_model] :: addCityUser() : Start");
    const Id = uuidv1();
    var dbQuery = "INSERT INTO [dbo].[user] ([Id], [UserName], [Email], [Phone], [Status], [Company])" +
        "VALUES ('" + Id +
        "', '" + cityUser.userName +
        "', '" + cityUser.emailAddress +
        "', '" + cityUser.phoneNo +
        "', '" + 1 +
        "', '" + "COH" +
        "')";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: addCityUser() : End");
    if (result.rowsAffected == 1) {
        return Id;
    } else {
        return null;
    }
}

exports.updateCityUser = async function (cityUser) {
    logger.debug("[user_model] :: updateCityUser() : Start");
    // const Id = uuidv1();
    var dbQuery = "UPDATE [user] SET UserName= '" + cityUser.userName + "', Email= '" + cityUser.emailAddress +
        "', Phone= '" + cityUser.phoneNo + "' WHERE Id= '" + cityUser.id + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: updateCityUser() : End");
    if (result.rowsAffected == 1) {
        return true;
    } else {
        return false;
    }
}

exports.updateUserRole = async function (roleId, userId) {
    logger.debug("[user_model] :: updateUserRole() : Start");
    //const Id = uuidv1();
    var dbQuery = "UPDATE [user_role] SET RoleId= '" + roleId + "' WHERE UserId= '" + userId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: updateUserRole() : End");
    return result.recordset;
}

exports.resetVendorEmail = async function (vendor) {
    logger.debug("[user_model] :: getUsersWithRole() : Start");
    var dbQuery = "UPDATE [user] SET Email= '" + vendor.emailAddress + "' WHERE Id= '" + vendor.id + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUsersWithRole() : End");
    if (result.rowsAffected == 1) {
        return true;
    } else {
        return false;
    }
}

exports.getCityUsersWithRole = async function (noOfItems) {
    logger.debug("[user_model] :: getCityUsersWithRole() : Start");
    var dbQuery = `SELECT TOP ${noOfItems} [user].Id as id, [user].UserName as userName, [user].Email as emailAddress,` +
        ` [user].Phone as phoneNo, [user].Status as status, [user].Company as company,` +
        ` [user].TaxId as taxId, [role].Description as role FROM [user]` +
        ` LEFT JOIN [user_role] ON [user].Id = [user_role].UserId` +
        ` LEFT JOIN [role] ON [role].Id = [user_role].RoleId` +
        ` WHERE lower([role].Description) IN ('super admin' ,'admin' ,'coh', 'cs admin')` +
        ` ORDER BY userName`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getCityUsersWithRole() : End");
    return result.recordset;
}

exports.getVendorsWithRole = async function (noOfItems) {
    logger.debug("[user_model] :: getVendorsWithRole() : Start");
    var dbQuery = `SELECT TOP ${noOfItems} [user].Id as id, [user].UserName as userName, [user].Email as emailAddress,
         [user].Phone as phoneNo, [user].Status as status, [user].Company as company,
         [user].TaxId as taxId, [role].Description as role, [professional_service_vendor].Id as psVendorId,
         [professional_service_vendor].ActMgrEmail as psAccMgrEmail, [professional_service_vendor].PrincipalEmail as psPrnicipalEmail, [professional_service_vendor].VendorNo as psVendorNo,
         [construction_vendor].Id as csVendorId, [construction_vendor].ActMgrEmail as csAccMgrEmail, [construction_vendor].PrincipalEmail as csPrincipalEmail
         FROM [user]
         LEFT JOIN [professional_service_vendor] ON [user].Id = [professional_service_vendor].UserId
		 LEFT JOIN [construction_vendor] ON [user].Id = [construction_vendor].UserId
         LEFT JOIN [user_role] ON [user].Id = [user_role].UserId
         LEFT JOIN [role] ON [role].Id = [user_role].RoleId
         WHERE ([role].Description = 'ps vendor' OR [role].Description = 'cs vendor')
         ORDER BY company`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getVendorsWithRole() : End");
    return result.recordset;
}

exports.getUserWithRole = async function (userId) {
    logger.debug("[user_model] :: getUserWithRole() : Start");
    var dbQuery = "SELECT [user].Id as id, [user].UserName as userName, [user].Email as emailAddress, [user].Phone as phoneNo, [user].Status as status, [user].Company as company," +
        " [user].TaxId as taxId, [role].Description as role FROM [user]" +
        " LEFT JOIN [user_role] ON [user].Id = [user_role].UserId" +
        " LEFT JOIN [role] ON [role].Id = [user_role].RoleId" +
        " WHERE [user].Id = '" + userId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUserWithRole() : End");
    return result.recordset;
}

exports.isUserNameExists = async function (user) {
    logger.debug("[user_model] :: isUserNameExists() : Start");
    var dbQuery = `SELECT [user].UserName, [user].Email FROM [user] WHERE ([user].UserName = '${user.username}' OR [user].Email ='${user.email}') AND [user].Id != '${user.id}'`;
    console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: isUserNameExists() : End");
    return result.recordset;
}

exports.getVendorByUserId = async function (userId) {
    logger.debug("[user_model] :: getUserWithRole() : Start");
    var dbQuery = "SELECT [user].Id as id,[user].username as Username, [professional_service_vendor].Id as PSVendorId, [professional_service_vendor].Vendor as PSVendorName, [construction_vendor].Id as CSVendorId , [construction_vendor].Vendor as CSVendorName  " +
        " FROM [user]" +
        " LEFT JOIN [professional_service_vendor] ON [user].Id = [professional_service_vendor].UserId" +
        " LEFT JOIN [construction_vendor] ON [user].Id = [construction_vendor].UserId" +
        " WHERE [user].Id = '" + userId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUserWithRole() : End");
    return result.recordset;
}

// add PS vendor and CS vendor related emails for RFQ updates
exports.subscribeUserForRFQUpdates = async function (name, companyName, email) {
    logger.debug("[user_model] :: subscribeUserForRFQUpdates() : Start");
    var Id = uuidv1();
    var dbQuery = `IF NOT EXISTS (SELECT * FROM [subscribe_user] WHERE Email = '${email}')
                   BEGIN
                        INSERT INTO [subscribe_user] (Id, Name, CompanyName, Email)
                        VALUES ('${Id}', '${name == null ? "" : util.replaceQuotes(name)}', '${util.replaceQuotes(companyName)}', '${email}')
                   END`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: subscribeUserForRFQUpdates() : End");
    return result.rowsAffected;
}

//get search result
exports.getSearchResults = async function (params, noOfItems) {
    logger.debug("[user_model] :: getSearchResults() : Start");
    var dbQuery = "SELECT TOP " + noOfItems + " [user].Id as id, [user].UserName as userName, [user].Email as emailAddress," +
        " [user].Phone as phoneNo, [user].Status as status, [user].Company as company," +
        " [user].TaxId as taxId, [role].Description as role, [professional_service_vendor].Id as psVendorId," +
        " [construction_vendor].Id as csVendorId FROM [user]" +
        " LEFT JOIN [user_role] ON [user].Id = [user_role].UserId" +
        " LEFT JOIN [role] ON [role].Id = [user_role].RoleId" +
        " LEFT JOIN [professional_service_vendor] ON [user].Id = [professional_service_vendor].UserId" +
        " LEFT JOIN [construction_vendor] ON [user].Id = [construction_vendor].UserId"
    if (params.type == 'psVendor') {
        dbQuery += " WHERE [role].Description = 'ps vendor' "
    } else if (params.type == 'csVendor') {
        dbQuery += " WHERE [role].Description = 'cs vendor' "
    } else if (params.type == 'vendorName') {
        dbQuery += " WHERE ([role].Description = 'ps vendor' OR [role].Description = 'cs vendor')"
        if (params.value != "") {
            dbQuery += " AND UPPER([user].Company) LIKE '%" + util.replaceQuotes(params.value) + "%'";
        }
    } else if (params.type == 'vendorType') {
        dbQuery += " WHERE ([role].Description = 'ps vendor' OR [role].Description = 'cs vendor')"
    }
    dbQuery += " ORDER BY company"
    console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getSearchResults() : End");
    return result.recordset;
}

exports.getRoles = async function () {
    logger.debug("[user_model] :: getRoles() : Start");
    var dbQuery = "SELECT * FROM [role] ORDER BY Description";
    console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getRoles() : End");
    return result.recordset;
}

exports.getCityUserSearchResults = async function (params, noOfCityUsers) {
    logger.debug("[user_model] :: getCityUserSearchResults() : Start");
    let query = ``;
    if (params.value.indexOf('[') > -1) {
        query = ` AND UPPER([user].UserName) LIKE '%${util.replaceQuotes(this.insertAt(params.value)).toUpperCase()}%' ESCAPE '\\'`
    } else {
        query = ` AND UPPER([user].UserName) LIKE '%${util.replaceQuotes(params.value)}%'`
    }
    var dbQuery = `SELECT TOP ${noOfCityUsers} [user].Id as id, [user].UserName as userName, [user].Email as emailAddress,
         [user].Phone as phoneNo, [user].Status as status, [user].Company as company,
         [user].TaxId as taxId, [role].Description as role FROM [user]
         LEFT JOIN [user_role] ON [user].Id = [user_role].UserId
         LEFT JOIN [role] ON [role].Id = [user_role].RoleId
         WHERE lower([role].Description) IN ('super admin' ,'admin' ,'coh', 'cs admin') ${query}
         ORDER BY userName`;
    console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getCityUserSearchResults() : End");
    return result.recordset;
}

exports.getVendorSearchResults = async function (params, noOfCityUsers) {
    logger.debug("[user_model] :: getVendorSearchResults() : Start");
    let query = ``;
    if (params.value.indexOf('[') > -1) {
        query = ` AND UPPER([user].Company) LIKE '%${util.replaceQuotes(this.insertAt(params.value)).toUpperCase()}%' ESCAPE '\\'`
    } else {
        query = ` AND UPPER([user].Company) LIKE '%${util.replaceQuotes(params.value)}%'`
    }
    var dbQuery = `SELECT TOP ${noOfCityUsers} [user].Id as id, [user].UserName as userName, [user].Email as emailAddress,
         [user].Phone as phoneNo, [user].Status as status, [user].Company as company,
         [user].TaxId as taxId, [role].Description as role, [professional_service_vendor].Id as psVendorId,
         [professional_service_vendor].ActMgrEmail as psAccMgrEmail, [professional_service_vendor].PrincipalEmail as psPrnicipalEmail,
         [construction_vendor].Id as csVendorId, [construction_vendor].ActMgrEmail as csAccMgrEmail, [construction_vendor].PrincipalEmail as csPrincipalEmail
         FROM [user]
         LEFT JOIN [professional_service_vendor] ON [user].Id = [professional_service_vendor].UserId
		 LEFT JOIN [construction_vendor] ON [user].Id = [construction_vendor].UserId
         LEFT JOIN [user_role] ON [user].Id = [user_role].UserId
         LEFT JOIN [role] ON [role].Id = [user_role].RoleId
         WHERE ([role].Description = 'ps vendor' OR [role].Description = 'cs vendor') ${query}
         ORDER BY company`;
    console.log(dbQuery)
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getVendorSearchResults() : End");
    return result.recordset;
}

exports.insertAt = function (str) {
    let position = str.indexOf('[');
    let output = str.substring(0, position) + `\\` + str.substring(position);
    return output;
}

exports.getVendorDetails = async function (Id) {
    logger.debug("[user_model] :: getVendorsWithRole() : Start");
    var dbQuery = `SELECT [user].Id as id, 
                    [user].Company, [user].TaxId, [role].Description as role, [user].UserName, [user].Email,
                    [professional_service_vendor].Id as psVendorId, [construction_vendor].Id as csVendorId,
                    [professional_service_vendor].VendorNo as psVendorNo, [construction_vendor].VendorNo as csVendorNo,
                    [professional_service_vendor].DBA AS psDBA, [construction_vendor].DBA AS csDBA,
                    [professional_service_vendor].IsLockedByAdmin as psIsLockedByAdmin, [construction_vendor].IsLockedByAdmin as csIsLockedByAdmin
                    FROM [user] 
                    LEFT JOIN [user_role] ON [user].Id = [user_role].UserId LEFT JOIN [role] ON [role].Id = [user_role].RoleId 
                    LEFT JOIN [professional_service_vendor] ON [user].Id = [professional_service_vendor].UserId 
                    LEFT JOIN [construction_vendor] ON [user].Id = [construction_vendor].UserId 
                    WHERE (([role].Description = 'ps vendor' OR [role].Description = 'cs vendor') AND [user].Id = '${Id}')`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getVendorsWithRole() : End");
    return result.recordset;
}

exports.updateVendorDetails = async function (params) {
    logger.debug("[user_model] :: updateVendorDetails() : Start");
    var dbQuery1 = "";
    if (params.role === "ps vendor") {
        dbQuery1 = `UPDATE [professional_service_vendor] SET [Vendor] = '${util.replaceQuotes(params.company)}', [VendorNo] = '${util.replaceQuotes(params.vendorNo)}', [DBA] = '${util.replaceQuotes(params.dba)}', [IsLockedByAdmin] = '1' WHERE [UserId] = '${params.id}'`;
    } else if (params.role === "cs vendor") {
        dbQuery1 = `UPDATE [construction_vendor] SET [Vendor] = '${util.replaceQuotes(params.company)}', [VendorNo] = '${util.replaceQuotes(params.vendorNo)}', [DBA] = '${util.replaceQuotes(params.dba)}', [IsLockedByAdmin] = '1' WHERE [UserId] = '${params.id}'`;
    }
    await db.query(dbQuery1);
    var dbQuery2 = `UPDATE [user] SET [Company] = '${util.replaceQuotes(params.company)}', [TaxId] = '${params.taxId}' WHERE Id = '${params.id}'`;
    var result = await db.query(dbQuery2);
    logger.debug("[user_model] :: updateVendorDetails() : End");
    return result.rowsAffected;
}

// To get registered user email, account manager email and principal contact email of a cs / ps vendor
exports.getEmailsByUserId = async function (userId) {
    logger.debug("[user_model] :: getEmailsByUserId() : Start");
    var dbQuery = `SELECT [ActMgrEmail] AS email FROM [professional_service_vendor] WHERE UserId ='${userId}'
                    UNION
                    SELECT [PrincipalEmail] AS email FROM [professional_service_vendor] WHERE UserId ='${userId}'
                    UNION
                    SELECT[ActMgrEmail] AS email FROM [construction_vendor] WHERE UserId ='${userId}'
                    UNION
                    SELECT [PrincipalEmail] AS email FROM [construction_vendor] WHERE UserId ='${userId}'
                    UNION
                    SELECT Email AS email FROM [user] WHERE Id ='${userId}'`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getEmailsByUserId() : End");
    return result.recordset;
}

// Adding data on user launch / cancel tour guide 
exports.addUserAdditionalInfo = async function (Id, userId, isTourGuideLaunched) {
    logger.debug("[user_model] :: addUserAdditionalInfo() : Start");
    var dbQuery = `INSERT INTO [user_additonal_info] VALUES ('${Id}', '${userId}', ${isTourGuideLaunched})`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: addUserAdditionalInfo() : End");
    return result.recordset;
}

// To check if user has performed launch or cancel tour guide
exports.getUserAdditionalInfoByUserId = async function (userId) {
    logger.debug("[user_model] :: getUserAdditionalInfoByUserId() : Start");
    var dbQuery = `SELECT * FROM  [user_additonal_info] WHERE UserId ='${userId}'`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUserAdditionalInfoByUserId() : End");
    return result.recordset;
}

// Manage subscribed users - get  user emails
exports.getSubscribers = async function (noOfSubscribers) {
    logger.debug("[user_model] :: getSubscribers() : Start");
    var dbQuery = `SELECT TOP  ${noOfSubscribers} * FROM  [subscribe_user] ORDER BY Email`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getSubscribers() : End");
    return result.recordset;
}

// Manage subscribed users - search by user emails
exports.getSubscriberSearchResults = async function (noOfSubscribers, value) {
    logger.debug("[user_model] :: getSubscriberSearchResults() : Start");
    var dbQuery = `SELECT TOP  ${noOfSubscribers} * FROM  [subscribe_user] WHERE Email LIKE '%${util.replaceQuotes(value)}%' ORDER BY Email`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getSubscriberSearchResults() : End");
    return result.recordset;
}

// Manage subscribed users - Enalbe/disable user emails 
exports.changeSubscriberStatus = async function (Id, status) {
    logger.debug("[user_model] :: changeSubscriberStatus() : Start");
    var dbQuery = `UPDATE [subscribe_user] SET Status = '${status}' WHERE Id = '${Id}'`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: changeSubscriberStatus() : End");
    return result.rowsAffected[0];
}

// Manage subscribed users - Get email by Id to add Logs
exports.getSubscriberEmailById = async function (Id) {
    logger.debug("[user_model] :: getSubscriberEmailById() : Start");
    var dbQuery = `SELECT Email FROM [subscribe_user] WHERE Id = '${Id}'`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getSubscriberEmailById() : End");
    return result.recordset;
}

// Return the status of construction registration for given user Id
exports.getCRStatusByUserId = async function (userId) {
    logger.debug("[user_model] :: getCRStatusByUserId() : Start");
    var dbQuery = `SELECT [Status] FROM [construction_prequalification_status] WHERE Id = 
                    (SELECT [StatusId] FROM [construction_prequalification] WHERE VendorId =
                    (SELECT Id FROM [construction_vendor] WHERE [UserId] = '${userId}'))`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getCRStatusByUserId() : End");
    return result.recordset;
}

// Return the status of SOQ for given user Id
exports.getSOQStatusByUserId = async function (userId) {
    logger.debug("[user_model] :: getSOQStatusByUserId() : Start");
    var dbQuery = ` SELECT COUNT(x.Status) AS submittedCount FROM (
                    SELECT Status FROM [SOQ] WHERE VendorId IN (
                    SELECT Id FROM [professional_service_vendor] WHERE 
                    UserId = '${userId}')) AS x WHERE x.Status = 'Submitted'`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getSOQStatusByUserId() : End");
    return result.recordset;
}

// Switch PS vendor to CS vendor
exports.switchToCSVendor = async function (userId) {
    logger.debug("[user_model] :: switchToCSVendor() : Start");

    var vendorOfficeQuery = `DELETE FROM [vendor_office] WHERE [VendorId] IN 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId]='${userId}')`;
    console.log(vendorOfficeQuery)

    var vendorServiceFeeQuery = `DELETE FROM [vendor_service_fee] WHERE [VendorId] IN 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId]='${userId}')`;
    console.log(vendorServiceFeeQuery)

    var flPersonnelQuery = `DELETE FROM [vendor_full_time_personnel] WHERE [VendorId] IN 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId]='${userId}')`;
    console.log(flPersonnelQuery)

    var hpwFlPersonnelQuery = `DELETE FROM [HPW100_full_time_personnel] WHERE [HPW100Id] IN (
                    SELECT Id FROM [HPW100] WHERE VendorId = 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`;
    console.log(hpwFlPersonnelQuery)

    var hpwOfficeQuery = `DELETE FROM [HPW100_office] WHERE [HPW100Id] IN (
                    SELECT Id FROM [HPW100] WHERE VendorId = 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`;
    console.log(hpwOfficeQuery)

    var hpwProfileQuery = `DELETE FROM [HPW100_profile] WHERE [HPW100Id] IN (
                    SELECT Id FROM [HPW100] WHERE VendorId = 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`;
    console.log(hpwProfileQuery)

    var hpwServiceFeeQuery = `DELETE FROM [HPW100_service_fee] WHERE [HPW100Id] IN (
                    SELECT Id FROM [HPW100] WHERE VendorId = 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`;
    console.log(hpwServiceFeeQuery)

    var workExpQuery = `DELETE FROM [work_experience] WHERE [HPW100Id] IN 
                    (SELECT Id FROM [HPW100] WHERE VendorId IN
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`;
    console.log(workExpQuery)

    var hpwSoqQuery = `DELETE  FROM [HPW100_SOQ] WHERE [HPW100Id] IN 
                    (SELECT Id FROM [HPW100] WHERE VendorId IN
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`
    console.log(hpwSoqQuery)

    var hpwQuery = `DELETE FROM [HPW100] WHERE VendorId = 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}')`;
    console.log(hpwQuery)

    var soqSubVendorQuery = `DELETE FROM [SOQ_subvendor] WHERE [SOQId] IN (SELECT Id FROM [SOQ] WHERE [VendorId] IN 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`;
    console.log(soqSubVendorQuery)

    /*var dbQuery12 = `DELETE FROM [SOQ_generated_pdf] WHERE [SOQId] IN (SELECT Id FROM [SOQ] WHERE [VendorId] IN 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}'))`;
    console.log(dbQuery12)
    await db.query(dbQuery12);*/

    var soqQuery = `DELETE FROM [SOQ] WHERE [VendorId] IN 
                    (SELECT Id FROM [professional_service_vendor] WHERE [UserId] = '${userId}')`;
    console.log(soqQuery)

    var copyToCSVendorQuery = `INSERT INTO [construction_vendor] 
                    (Id, UserId, ActMgrName, ActMgrPhone, ActMgrEmail, Status, Vendor, BusinessAddress, BusinessAddrCity,
                    BusinessAddrState, BusinessAddrZipcode, IsMailingAddrSame, MailingAddress, MailingAddrCity, MailingAddrState, MailingAddrZipcode, 
                    IsHoustonOfcPresent, IsHoustonOfcParentComp, ParentCompany, Website, PrincipalName, PrincipalEmail, PrincipalPhone, PrincipalTitle,
                    Certified, Email, Phone, CertificationNo, YearEstablished, VendorNo, HoustonOffice, DBA, IsLockedByAdmin)
                
                    SELECT Id, UserId, ActMgrName, ActMgrPhone, ActMgrEmail, '1', Vendor, BusinessAddress, BusinessAddrCity, 
                    BusinessAddrState, BusinessAddrZipcode, IsMailingAddrSame, MailingAddress, MailingAddrCity, MailingAddrState, MailingAddrZipcode, 
                    IsHoustonOfcPresent, IsHoustonOfcParentComp, ParentCompany, Website, PrincipalName, PrincipalEmail, PrincipalPhone, PrincipalTitle,
                    IsCertified, (select Email from [user] WHERE Id='${userId}'), Phone, CertificateNo, YearEstablished, VendorNo, HoustonOffice, DBA, IsLockedByAdmin
                    FROM [professional_service_vendor] WHERE [UserId]='${userId}'`;
    console.log(copyToCSVendorQuery)

    var deleteFormPSVendorQuery = `DELETE FROM [professional_service_vendor] WHERE [UserId] = '${userId}'`;
    console.log(deleteFormPSVendorQuery)

    var updateRoleQuery = `UPDATE [user_role] SET [RoleId] = (SELECT Id FROM [role] WHERE [Description] = 'cs vendor') 
                    WHERE [UserId] = '${userId}'`;
    console.log(updateRoleQuery)

    var deleteSubscriberQuery = `DELETE FROM subscribe_user WHERE Email = 
                                (SELECT [Email] FROM [user] WHERE Id = '${userId}')`;
    console.log(deleteSubscriberQuery)

    let queryList = [vendorOfficeQuery, vendorServiceFeeQuery, flPersonnelQuery, hpwFlPersonnelQuery, hpwOfficeQuery, hpwProfileQuery, hpwServiceFeeQuery,
        workExpQuery, hpwSoqQuery, hpwQuery, soqSubVendorQuery, soqQuery, copyToCSVendorQuery, deleteFormPSVendorQuery, updateRoleQuery, deleteSubscriberQuery]

    return new Promise((resolve, reject) => {
        const transaction = db.transaction();
        transaction.begin((err) => {
            let rolledBack = false;
            async.mapSeries(queryList, (statement, next) => {
                transaction.on('rollback', aborted => {
                    rolledBack = true;
                });
                let request = new sql.Request(transaction);
                request.query(statement, next);
            }, (err, results) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            reject();
                        });
                    }
                } else {
                    transaction.commit((err, recordset) => {
                        console.log("Transaction commited.");
                        resolve();
                    });
                }
            });
        });
        logger.trace("[user_model] :: switchToCSVendor() : End");
    })
}

//switch CS vendor to PS vendor
exports.switchToPSVendor = async function (userId) {
    logger.debug("[user_model] :: switchToPSVendor() : Start");

    var cpdocMappingQuery = `DELETE FROM [construction_prequalification_doc_mapping] WHERE [CPId] IN (
                    SELECT Id FROM [construction_prequalification] WHERE [VendorId] = 
                    (SELECT Id FROM [construction_vendor] WHERE [UserId]='${userId}'))`;
    console.log(cpdocMappingQuery)

    var cpStatusLogQuery = `DELETE FROM [construction_prequalification_status_log] WHERE [CPId] IN (
                    SELECT Id FROM [construction_prequalification] WHERE [VendorId] = 
                    (SELECT Id FROM [construction_vendor] WHERE [UserId]='${userId}'))`;
    console.log(cpStatusLogQuery)

    var cpQuery = `DELETE FROM [construction_prequalification] WHERE [VendorId] = 
                    (SELECT Id FROM [construction_vendor] WHERE [UserId]='${userId}')`;
    console.log(cpQuery)

    var copyToPSVendorQuery = `INSERT into [professional_service_vendor]
                    (Id, UserId, ActMgrName, ActMgrPhone, ActMgrEmail, Vendor, BusinessAddress, BusinessAddrCity, 
                    BusinessAddrState, BusinessAddrZipcode, IsMailingAddrSame, MailingAddress, MailingAddrCity, MailingAddrState, MailingAddrZipcode, 
                    IsHoustonOfcPresent, IsHoustonOfcParentComp, ParentCompany, Website, PrincipalName, PrincipalEmail, PrincipalPhone, PrincipalTitle,
                    IsCertified, Mailing, Phone, CertificateNo, YearEstablished, VendorNo, HoustonOffice, DBA, IsLockedByAdmin) 
                
                    SELECT 
                    Id, UserId, ActMgrName, ActMgrPhone, ActMgrEmail, Vendor, BusinessAddress, BusinessAddrCity,
                    BusinessAddrState, BusinessAddrZipcode, IsMailingAddrSame, MailingAddress, MailingAddrCity, MailingAddrState, MailingAddrZipcode, 
                    IsHoustonOfcPresent, IsHoustonOfcParentComp, ParentCompany, Website, PrincipalName, PrincipalEmail, PrincipalPhone, PrincipalTitle,
                    Certified, (SELECT Email FROM [user] WHERE Id='${userId}' ), Phone, CertificationNo, YearEstablished, VendorNo, HoustonOffice, DBA, IsLockedByAdmin
                    FROM [construction_vendor] WHERE [UserId]='${userId}'`;
    console.log(copyToPSVendorQuery)

    var deleteFormCSVendorQuery = `DELETE FROM [construction_vendor] WHERE [UserId]='${userId}'`;
    console.log(deleteFormCSVendorQuery)

    var updateRoleQuery = `UPDATE [user_role] SET [RoleId] = 
                    (SELECT Id FROM [role] WHERE [Description] = 'ps vendor') WHERE [UserId] = '${userId}'`;
    console.log(updateRoleQuery)

    var addSubscriberQuery = `INSERT INTO [subscribe_user] (Id, Name, CompanyName, Email, Status)
                            SELECT '${uuidv1()}', [UserName], [Company], [Email], '1' FROM  [user] WHERE Id = '${userId}'`;
    console.log(addSubscriberQuery)

    let queryList = [cpdocMappingQuery, cpStatusLogQuery, cpQuery, copyToPSVendorQuery,
        deleteFormCSVendorQuery, updateRoleQuery, addSubscriberQuery]

    return new Promise((resolve, reject) => {
        const transaction = db.transaction();
        transaction.begin((err) => {
            let rolledBack = false;
            async.mapSeries(queryList, (statement, next) => {
                transaction.on('rollback', aborted => {
                    rolledBack = true;
                });
                let request = new sql.Request(transaction);
                request.query(statement, next);
            }, (err, results) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            reject();
                        });
                    }
                } else {
                    transaction.commit((err, recordset) => {
                        console.log("Transaction commited.");
                        resolve();
                    });
                }
            });
        });
        logger.debug("[user_model] :: switchToPSVendor() : End");
    });
}

exports.getUserRoleIdByUserId = async function (userId) {
    logger.debug("[user_model] :: getUserRoleIdByUserId() : Start");
    var dbQuery = "SELECT [role].Id FROM [role]" +
        " LEFT JOIN [user_role] ON [role].Id = [user_role].RoleId" +
        " WHERE [user_role].UserId = '" + userId + "'";
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUserRoleIdByUserId() : End");
    return result.recordset[0].Id;
};

// Get corresponding Links of admin side bar based on roleId
exports.getRoleCapabilityByUserId = async function (userId) {
    logger.debug("[user_model] :: getRoleCapabilityByRoleId() : Start");
    var dbQuery = `SELECT STRING_AGG([role_capability].Name, ',') AS allowedItems
                   FROM [role_capability]  WHERE Roles LIKE 
                   '%' + (SELECT [role].Id FROM [role] LEFT JOIN [user_role] ON [role].Id = 
                   [user_role].RoleId WHERE [user_role].UserId = '${userId}') + '%'`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getRoleCapabilityByRoleId() : End");
    return result.recordset
}

//Get PS vendors of the system
exports.getPSVendors = async function () {
    logger.debug("[user_model] :: getPSVendors() : Start");
    var dbQuery = `SELECT [user].Id FROM [user] LEFT JOIN [user_role] on [user].Id = [user_role].UserId 
                   WHERE [user_role].RoleId = (SELECT Id FROM [role] WHERE [Description]='ps vendor')
                   AND [user].Status = '1'`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getPSVendors() : End");
    return result.recordset
}

exports.getUserRoleByUserEmail = async function (email) {
    logger.debug("[user_model] :: getUserRoleByUserEmail() : Start");
    var dbQuery = ` SELECT [Description] FROM [role] WHERE Id IN(
                    SELECT [RoleId] FROM [user_role] WHERE [UserId] IN (
                    SELECT Id FROM [user] WHERE [Email] = '${email}'))`;
    var result = await db.query(dbQuery);
    logger.trace("[user_model] :: getUserRoleByUserEmail() : End");
    return result.recordset
}

exports.getAdminEmails = async function () {
    logger.debug("[user_model] :: getAdminEmails() : Start");
    const dbQuery = `SELECT [user].Email  FROM [user] 
                            JOIN [user_role] ON [user].Id = [user_role].UserId
                            JOIN [role] ON [role].Id = [user_role].RoleId 
                            WHERE lower([role].Description) IN ('super admin' ,'admin')
                            AND [user].Status = '1'`;
    const result = await db.query(dbQuery);
    logger.trace("[user_model] :: getAdminEmails() : End");
    return result.recordset;
};



