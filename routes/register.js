const express = require('express');
const router = express.Router();

const registerController = require('../controllers/register');

/* GET */
router.get('/register',
    registerController.getRegisterPage);

router.get('/register-passwords',
    registerController.getRegisterPasswordsPage);

/* POST */
router.post('/register-passwords',
    registerController.postRegisterPasswords);

module.exports = router;
