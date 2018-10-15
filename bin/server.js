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
const mongoose = require('mongoose');

dotenv.config();

debug('Starting HTTP and HTTPS Servers');
// Certificate
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

app.use(helmet()); // Add Helmet as a middleware

const privateKey = fs.readFileSync('ssl/localhost-privkey.pem', 'utf8');
const certificate = fs.readFileSync('ssl/localhost-cert.pem', 'utf8');
const dhparamKey = fs.readFileSync('ssl/dh-strong.pem', 'utf8');

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

const onError = error => {
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

app.use((req, res) => {
  res.send('Hello there !');
});

// Starting both http & https servers
const httpServer = http.createServer(app);
httpServer.on('error', onError);
httpServer.on('listening', onHTTPListening);
httpServer.listen(httpPort, () => {
  logger.log('info', `HTTP Server running on port ${httpPort}`);
});

const httpsServer = https.createServer(credentials, app);
httpsServer.on('error', onError);
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

process.on('SIGTERM', () => {
  logger.log('error', 'SIGTERM signal received.');
  logger.log('error', 'Closing https server.');
  httpsServer.close(() => {
    logger.log('error', 'Https server closed.');
    // boolean means [force], see in mongoose doc
    mongoose.connection.close(false, () => {
      logger.log('error', 'MongoDb connection closed.');
      process.exit(0);
    });
  });
});
