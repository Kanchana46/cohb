var mssql = require("mssql");

// config for your database
const dbConfig = {
    server: 'coh-test-mssql.cre2ljedvd0s.us-east-1.rds.amazonaws.com',
    database: 'COHTest',
    user: 'cohdbuser',
    password: 'P0rtAlUs3r!',
    port: parseInt(1433),
};

var connection = new mssql.ConnectionPool(dbConfig);

connection.connect(function (err, next) {
    if (err) {
        console.log(err);
        console.log("Failed to connect to the database!");
        console.log('userName:' + process.env.RDS_USERNAME);
        console.log('hostName:' + process.env.RDS_HOSTNAME);
        console.log('password:' + process.env.RDS_PASSWORD);
        console.log('database:' + process.env.RDS_DATABASE);
        console.log('port:' + process.env.RDS_PORT);
    } else {
        console.log("Connected to the database - " + process.env.RDS_HOSTNAME);
    }
});


module.exports = connection;