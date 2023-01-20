const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

/* GET */
router.get('/', userController.getLoginPage);

router.get('/register', userController.getRegisterPage);

router.get('/register-passwords', userController.getRegisterPasswordsPage);

/* POST */
router.post('/', userController.postLoginPage);

router.post('/register-passwords', userController.postRegisterPasswords);

router.post('/api', userController.logIn);

module.exports = router;