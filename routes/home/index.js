const express = require("express");
const router = express.Router();

router.get('/', (req, res, next) => {
  const protocol = req.connection.encrypted ? 'Running Using Secure HTTPS Protocol' : 'Running Using Insecure HTTP Protocol';
  res.status(200);
  res.render('index', {
    title: 'API Server Home',
    protocol: protocol,
  });
});

router.get('/health-check', (req, res, next) => {
  res.status(200).json({
    message: 'Server health is OK!',
  });
});

module.exports = router;
