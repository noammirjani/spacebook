const express = require('express');
const router = express.Router();

const loginController = require('../controllers/login');
const { checkAccessGetRequest, checkAccessPostRequest } = require('./checkAccess');


/* GET */
router.get('/',
    checkAccessGetRequest,
    loginController.getLoginPage);

router.get('/login',
    checkAccessGetRequest,
    loginController.getLoginPage);

router.get('/home', loginController.getApp);

/* POST */
router.post('/', checkAccessPostRequest);
router.post('/login', checkAccessPostRequest);
router.post('/home', loginController.enterHomePage);

module.exports = router;
