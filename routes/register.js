const express = require('express');
const router = express.Router();

const registerController = require('../controllers/register');
const {checkAccessGetRequest, checkAccessPostRequest} = require('./checkAccess');

/* GET */
router.get('/register',
    checkAccessGetRequest,
    registerController.getRegisterPage);

router.get('/register-passwords',
    checkAccessGetRequest,
    registerController.getRegisterPasswordsPage);


/* POST */
router.post('/register-passwords', registerController.postRegisterPasswords);

module.exports = router;
