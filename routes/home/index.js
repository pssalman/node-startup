const express = require('express');
const uuidv4 = require('uuid/v4');

const router = express.Router();

router.get('/', (req, res, next) => {
  const protocol = req.connection.encrypted ? 'Running Using Secure HTTPS Protocol' : 'Running Using Insecure HTTP Protocol';
  res.type('html');
  res.status(200);
  res.render('index', {
    title: 'API Server Home',
    protocol: protocol,
    request: req.sessionID,
  });
});

router.get('/health-check', (req, res, next) => {
  res.type('json');
  res.status(200).json({
    status: res.statusCode,
    message: 'Server health is OK!',
    request: req.sessionID,
  });
});

module.exports = router;
