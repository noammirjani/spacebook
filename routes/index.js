const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

/* GET */
router.get('/', userController.getLogin);

router.get('/register', userController.getRegister);

router.get('/register-passwords', userController.getRegisterPasswords);

/* POST */
router.post('/', userController.postLogin);

router.post('/register-passwords', userController.postRegisterPasswords);

router.post('/api', userController.tryLogIn);

module.exports = router;