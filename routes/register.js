const express = require('express');
const router = express.Router();

const registerController = require('../controllers/register');
const access = require('../controllers/checkAccess');

/* GET */
router.get('/register',
    access.checkAccessGetRequest,
    registerController.getRegisterPage);

router.get('/register-passwords',
    access.checkAccessGetRequest,
    registerController.getRegisterPasswordsPage);


/* POST */
router.post('/register-passwords', registerController.postRegisterPasswords);

module.exports = router;
