// Dependencies
// const cluster = require('cluster');
const app = require('../app');
const debug = require('debug')('app:server');
const fs = require('fs');
const http = require('http');
const https = require('https');
// const express = require('express');
const helmet = require('helmet');
const logger = require('../config/logger/index');
const dotenv = require('dotenv');
// const mail = require('../config/mail/index');
// const numCPUs = require('os').cpus().length;
const Mongoose = require('../config/db/index');

dotenv.config();

debug('Starting HTTP and HTTPS Servers');

app.use(helmet()); // Add Helmet as a middleware
// Certificates
const privateKey = fs.readFileSync('ssl/localhost-privkey.pem', 'utf8');
const certificate = fs.readFileSync('ssl/localhost-cert.pem', 'utf8');
const dhparamKey = fs.readFileSync('ssl/dh-strong.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  dhparam: dhparamKey,
  // ca: ca
};

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onHTTPError = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const httpAddr = httpServer.address();
  const bind = typeof httpAddr === 'string' ? `pipe ${httpAddr}` : `port ${httpPort}`;
  switch (error.code) {
    case 'EACCES':
      logger.log('error', `${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.log('error', `${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onHTTPSError = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const httpsAddr = httpsServer.address();
  const bind = typeof httpsAddr === 'string' ? `pipe ${httpsAddr}` : `port ${httpsPort}`;
  switch (error.code) {
    case 'EACCES':
      logger.log('error', `${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.log('error', `${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onHTTPListening = () => {
  const httpAddr = httpServer.address();
  const httpBind = typeof httpAddr === 'string' ? `pipe ${httpAddr}` : `port ${httpPort}`;
  debug(`Listening on ${httpBind}`);
};

const onHTTPSListening = () => {
  const httpsAddr = httpsServer.address();
  const httpsBind = typeof httpsAddr === 'string' ? `pipe ${httpsAddr}` : `port ${httpsPort}`;
  debug(`Listening on ${httpsBind}`);
};

const httpPort = normalizePort(process.env.HTTP_PORT || '3080');
const httpsPort = normalizePort(process.env.HTTPS_PORT || '3443');
app.set('httpPort', httpPort);
app.set('httpsPort', httpsPort);

// app.use((req, res) => {
//   res.send('Hello there !');
// });

// Starting both http & https servers
const httpServer = http.createServer(app);
httpServer.on('error', onHTTPError);
httpServer.on('listening', onHTTPListening);
httpServer.listen(httpPort, () => {
  logger.log('info', `HTTP Server running on port ${httpPort}`);
});

const httpsServer = https.createServer(credentials, app);
httpsServer.on('error', onHTTPSError);
httpsServer.on('listening', onHTTPSListening);
httpsServer.listen(httpsPort, () => {
  logger.log('info', `HTTPS Server running on port ${httpsPort}`);
});

process.on('uncaughtException', (e) => {
  debug('process.onUncaughException: %o', e);
  process.exit(1);
});

process.on('warning', (warning) => {
  debug('process.onWarning: %o', warning);
});

let gracefulExit = () => {
  debug('Connections termination signal was received');
  logger.log('error', 'Closing all active connections.');
  httpsServer.close(() => {
    logger.log('warn', 'Https server closed.');
    httpServer.close(() => {
      logger.log('warn', 'Http server closed.');
      Mongoose._connection().close(() => {
        logger.log('warn', 'Mongoose connection with DB is disconnected through app termination');
        process.exit(0);
      });
    });
  });
}
// If the Node process ends, close the http server connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
