const db = require("../models");

const COOKIE_ERROR = 'error';
const COOKIE_REGISTER = 'register';


/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLoginPage = (req, res) => {
    renderLogin(req, res);
}


exports.postLoginPage = (req, res) => {
    if(req.session.isLoggedIn) {
        delete req.session.isLoggedIn;
        req.session.save();
        res.redirect('/')
    }
    else return undefined;
}


/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getApp = (req, res) => {
    if(req.session.isLoggedIn)
        renderApp(req, res);
    else{
        res.cookie("error","please sign in");
        res.redirect('/')
    }
}


function updateSessionData(req, res, user) {
    req.session.userName = user.firstName + ' ' + user.lastName;
    req.session.email = user.email;
    req.session.isLoggedIn = true;
}


//POST LOGIN
/**
 * enterHomePage - logs in a user and renders the api page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.enterHomePage = async (req, res) => {
    let {email, password} = req.body;

    try {
        email = email.toLowerCase();
        const user = await db.User.findOne({where: {email}});
        if(!user) throw new Error("email is not found, please register")
        user.comparePasswords(password);
        updateSessionData(req,res,user);
        res.redirect('/home');;
    }
    catch(error){
        res.cookie(COOKIE_ERROR, error.message);
        res.redirect('/');
    }
}


exports.enterApp = (req, res) => {
    renderApp(req,res);
}


/**
 * getCookieText - gets the text from the cookie, clears it and return the data.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param {string} key - the cookie key
 */
function getCookieText(req, res, key){
    const text = req.cookies[key];
    if (text) res.clearCookie(key);
    return text;
}


//--- RENDER FUNCTIONS ----//
/**
 * renderApp - renders the api page
 * @param {Object} res - Express response object
 */
function renderApp(req,res){
    res.render("home", {title: 'api', name:req.session.userName, email:req.session.email})
}


/**
 * renderLogin - displays the login page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 */
function renderLogin(req, res){
    res.render('login', {
        title: 'Login',
        error: getCookieText(req,res,COOKIE_ERROR) || "",
        newRegistered: getCookieText(req,res,COOKIE_REGISTER) || ""});
}