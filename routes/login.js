const express = require('express');
const router  = express.Router();

const loginController    = require('../controllers/login');
const registerController = require('../controllers/register');


/* GET */
router.get('/',
    loginController.getLoginPage);

router.get('/login',
    loginController.getLoginPage);

router.get('/home',
    loginController.getApp);

/* POST */
router.post('/',
    registerController.postLoginPage);

router.post('/login',
    registerController.postLoginPage);

router.post('/home',
    loginController.enterHomePage);

module.exports = router;