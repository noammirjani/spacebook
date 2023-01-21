const express = require('express');
const router = express.Router();
const registerController = require('../controllers/register');
const loginController = require('../controllers/login');

/* GET */
router.get('/', registerController.getLoginPage);

router.get('/register', registerController.getRegisterPage);

router.get('/register-passwords', registerController.getRegisterPasswordsPage);

/* POST */
router.post('/', registerController.postLoginPage);

router.post('/register-passwords', registerController.postRegisterPasswords);

router.post('/api', registerController.logIn);

module.exports = router;