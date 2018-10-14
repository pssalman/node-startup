const express = require("express");
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const favicon = require('serve-favicon');
const debug = require('debug')('app:namespace')
const compression = require('compression');
const dotenv = require('dotenv');
const logger = require('./config/logger/index');
const db = require('./config/db/index');
const winston = require('winston');
const expressWinston = require('express-winston');

debug('Load My App');

dotenv.config();

const app = express();

debug(`Namespace is running in ${app.get('env')} environment)`);

app.use(morgan('combined', { stream: logger.stream }));  
app.use(helmet());

const whitelist = [
  'https://localhost:3443',
  'http://localhost:3080',
  'http://127.0.0.1:3080',
  'https://127.0.0.1:3443'
];
const corsOptions = {
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(compression());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'shhhhhhhhh',
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: path.join(__dirname, 'logs', 'access.log')
      })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: (req, res) => { return false; } // optional: allows to skip some log messages based on request and/or response
  })
);

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
    error: err
  });
});

app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: path.join(__dirname, 'logs', 'access-error.log')
      })
    ]
  })
);

module.exports = app;