const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const favicon = require('serve-favicon');
const debug = require('debug')('app:namespace');
const compression = require('compression');
const dotenv = require('dotenv');
const logger = require('./config/logger/index');
const Database = require('./config/db/index');
const MongoStore = require('connect-mongo')(session);
const winston = require('winston');
const expressWinston = require('express-winston');
const uuidv4 = require('uuid/v4');
const FileStore = require('session-file-store')(session);
const indexRoute = require('./routes/home/index');
const userRoute = require('./routes/users/index');

debug('Load My App');
// Load environment variables from .env
dotenv.config();
// Create App Instance
const app = express();
// Create App instance SessionID
app.locals.sessionID = crypto.randomBytes(32).toString('base64');
logger.log('info', app.locals.sessionID);
logger.log('info', `Namespace is running in ${app.get('env')} environment`);

debug(`Namespace is running in ${app.get('env')} environment)`);
// Setup app to use morgan and helmet
app.use(morgan('combined', { stream: logger.stream }));  
app.use(helmet());
// Setup app to use CORS
const whitelist = [
  'https://localhost:3443',
  'http://localhost:3080',
  'http://127.0.0.1:3080',
  'https://127.0.0.1:3443',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Enable compression on app
app.use(compression());
// Set views directory and views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// enable body-parser on app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// enable cookie-parser on app
app.use(cookieParser());
// Enable static files serving and favicon
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// enable express-session on app
app.use(session({
  name: 'api_server_cookie',
  genid: (req) => {
    console.log('Inside the session middleware');
    console.log(req.sessionID);
    return uuidv4(); // use UUIDs for session IDs
  },
  store: new MongoStore(
    {
      mongooseConnection: Database._connection(),
      autoRemove: 'disabled',
      collection: 'sessions',
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      autoRemove: 'interval', // use 'disabled' in production env
      autoRemoveInterval: 10, // In minutes. Default - Remove this in production env
    }
  ), // new FileStore(),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: true, maxAge: 365 * 24 * 60 * 60 * 1000 }
}));
// Enable Access Log on Requests
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'access.log'),
    }),
  ],
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: (req, res) => { return false; }, // optional: allows to skip some log messages based on request and/or response
}));
// Setup app routes
app.use('', indexRoute);
app.use('/api/v1/accounts', userRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Resource Not Found');
  err.status = 404;
  next(err);
});

// If our application encounters an error, we'll display the error and stack trace accordingly.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err,
  });
  // res.json({
  //   error: {
  //     message: err.message,
  //   }
  // });
});
// Enable Error Access Logs on app
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'access-error.log'),
    }),
  ],
}));

module.exports = app;
