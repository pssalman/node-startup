const express = require("express");
const router = express.Router();

router.get("", (req, res, next) => {
  const protocol = req.connection.encrypted ? 'https' : 'http';
  res.status(200).json({
    message: `Connected from ${protocol}`,
  });
});

module.exports = router;
