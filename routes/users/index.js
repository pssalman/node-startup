const express = require('express');

const router = express.Router();

const LoginController = require('../../controllers/users/login');
const SignUpController = require('../../controllers/users/signup');

router.post('/signup', SignUpController.signUp);

router.post('/login', LoginController.login);

module.exports = router;
