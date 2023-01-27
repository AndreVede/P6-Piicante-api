const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth');

// signup
router.post('/signup', authCtrl.signup);

// login
router.post('/login', authCtrl.login);

module.exports = router;
