const db = require("../models");
const cookies = require('./cookies');

const COOKIE_ERROR = 'error';
const COOKIE_REGISTER = 'register';

/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLoginPage = (req, res) => {
    res.render('index', {
        title: 'Login',
        error: cookies.getCookieText(req,res,COOKIE_ERROR) || "",
        newRegistered: cookies.getCookieText(req,res,COOKIE_REGISTER) || ""});
}


/**
 * updateSessionData - update the Session data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 */
function updateSessionData(req, res, user) {
    req.session.userName = user.firstName + ' ' + user.lastName;
    req.session.email = user.email;
    req.session.isLoggedIn = true;
}


/**
 * enterHomePage - logs in a user and renders the api page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.enterHomePage = async (req, res) => {

    try {
        console.log("in enter home page!")
        let {email, password} = req.body;
        email = email.toLowerCase();
        if(!email || !password) throw new Error("SORRY - data was not found, try again");

        const user = await db.User.findOne({where: {email}});
        if(!user) throw new Error("email is not found, please register");

        user.comparePasswords(password);
        updateSessionData(req,res,user);
        res.redirect('/home');
    }
    catch(error){
        res.cookie(COOKIE_ERROR, error.message);
       // res.redirect('/');
        res.render('index', {
            title: 'Login',
            error: error.message,
            newRegistered: ""});
    }
}