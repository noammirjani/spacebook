const express = require('express');
const router = express.Router();

const registerController = require('../controllers/register');
const loginController = require('../controllers/login');

function checkAccess(req,res, next){
    if(req.session.isLoggedIn)
        res.redirect('/home');
    else next();
}

/* GET */
router.get('/', checkAccess, loginController.getLoginPage);
router.get('/login', checkAccess, loginController.getLoginPage);

router.get('/register', checkAccess, registerController.getRegisterPage);

router.get('/register-passwords', checkAccess, registerController.getRegisterPasswordsPage);

router.get('/home', loginController.getApp);


/* POST */
router.post('/', loginController.postLoginPage);
router.post('/login', loginController.postLoginPage);

router.post('/register-passwords', registerController.postRegisterPasswords);

router.post('/home', loginController.enterHomePage);

module.exports = router;
