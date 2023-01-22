const express = require('express');
const router = express.Router();

const loginController = require('../controllers/login');
const access = require('../controllers/checkAccess');


/* GET */
router.get('/',
    access.checkAccessGetRequest,
    loginController.getLoginPage);

router.get('/login',
    access.checkAccessGetRequest,
    loginController.getLoginPage);

router.get('/home', loginController.getApp);

/* POST */
router.post('/', access.checkAccessPostRequest);
router.post('/login', access.checkAccessPostRequest);
router.post('/home', loginController.enterHomePage);

module.exports = router;
