// @ts-nocheck
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const i18n = require("i18n");
const bodyParser = require('body-parser');
const cors = require('cors');
const log4js = require('log4js');
const app = express();
const log = log4js.getLogger("app");
var routesV1 = require('./routes/v1/index');
var defaultRoute = require('./routes/index');
var fs = require('fs');

if (process.env.NODE_ENV) {
  let content = "(function (window) {" +
    "window.__env = window.__env || {};" +
    "window.__env.SERVER_URL = '" + process.env.SERVER_URL + "';" +
    "window.__env.CLIENT_URL = '" + process.env.CLIENT_URL + "';" +
    "window.__env.FILE_MAX_UPLOAD_MB = '" + process.env.FILE_MAX_UPLOAD_MB + "';" +
    "}(this));"
  fs.writeFile(path.join(__dirname.replace(/\\/g, "/"), '/views/dist/assets/environments/env.js'), content, (err) => {
    if (err) throw err;
    console.log('SERVER_URL :', process.env.SERVER_URL)
    console.log('Successfully saved env.js file.');
  });
} else {
  console.log("The environment variable 'NODE_ENV' is not set with the server URL.")
}

app.use(express.static(__dirname.replace(/\\/g, "/") + '/views/dist'))

app.get('/', function (req, res) {
  res.sendFile(__dirname.replace(/\\/g, "/") + '/views/dist/' + "index.html");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(log4js.connectLogger(log4js.getLogger("http"), {
  level: 'auto'
}));
app.use(express.json());
//preventing Denial-Of-Service (DOS) Attacks  limit the body payload
app.use(bodyParser.json({
  limit: '100mb'
}))
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true, // Just being explicit about the default.
  lastModified: true,  // Just being explicit about the default.
  setHeaders: (res, path) => {
    const hashRegExp = new RegExp('\\.[0-9a-f]{8}\\.');
    if (path.endsWith('.html')) {
      // All of the project's HTML files end in .html
      res.setHeader('Cache-Control', 'no-cache');
    } else if (hashRegExp.test(path)) {
      // If the RegExp matched, then we have a versioned URL.
      res.setHeader('Cache-Control', 'max-age=31536000');
    }
  }
}));


app.use(cors({ origin: process.env.CLIENT_URL.replace('/#', '') })); //NOTE : if needed we have to configure to allow only certain urls later
i18n.configure({
  locales: ['en'],
  directory: __dirname + '/locales'
});

//set the language
app.use(function (req, res, next) {
  let lang = req.headers['accept-language'];
  if (!lang) {
    lang = 'en';
  }
  i18n.setLocale(lang);
  next();
});

//set CORS headers 
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  //res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Cache-Control', 'private, max-age=0');
  // Pass to next layer of middleware
  next();
})

// calling route index
app.use('/api/v1', routesV1);
// calling default route
app.use('/', defaultRoute);

app.use(sendSpaFileIfUnmatched);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development    
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function sendSpaFileIfUnmatched(req, res, next) {
  res.sendFile('views/dist/index.html', { root: __dirname });
}

module.exports = app;