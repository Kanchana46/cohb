var log4js = require('log4js');

// Logger configuration
log4js.configure('./util/log4jsconf.json');
var logger = log4js.getLogger();
// We can use this condition after selecting a work environment
//if (process.env.NODE_ENV === 'production') {
//logger.level = "INFO";
//} else {
//logger.level = "TRACE";
//}

logger.level = "TRACE";

module.exports = logger;