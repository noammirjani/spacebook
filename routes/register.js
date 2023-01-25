const express = require('express');
const router = express.Router();

const registerController = require('../controllers/register');
const loginController = require('../controllers/login');

/* GET */
router.get('/',
    registerController.enterToRegisterPage);

router.get('/register-passwords',
    registerController.getRegisterPasswordsPage);

/* POST */
router.post('/',
     registerController.errorEnter); //is not suppose to happened though

router.post('/register-passwords',
    registerController.userBaseDataEntered);

router.post('/user-password', registerController.postLoginPage)


module.exports = router;
