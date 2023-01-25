const express = require('express');
const router  = express.Router();

const loginController    = require('../controllers/login');
const registerController = require('../controllers/register');


/* GET */
router.get('/',
    loginController.getLoginPage);

router.get('/login/submit',
    loginController.getApp);

/* POST */
router.post('/',
    registerController.postLoginPage);


router.post('/login/submit',
    loginController.enterHomePage);

module.exports = router;