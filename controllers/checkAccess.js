const loginController = require('./login');
const registerController = require('./register');

exports.checkAccessGetRequest = (req, res, next) => {
    if (req.session.isLoggedIn)
        res.redirect('/home');
    else next();
}

exports.checkAccessPostRequest = (req,res) => {
    if(req.session.isLoggedIn)
        loginController.postLoginPage(req,res);
    else
        registerController.postLoginPage(req,res);
}