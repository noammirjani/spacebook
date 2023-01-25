const express = require('express');
const router  = express.Router();

const loginController    = require('../controllers/login');


/* GET */
router.get('/',
    loginController.renderLoginPage);


/* POST */
router.post('/login/submit',
    loginController.enterHomePage);

module.exports = router;