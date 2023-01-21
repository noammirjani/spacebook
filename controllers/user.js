const db = require('../models');
const Sequelize = require('sequelize');

//const variables
const COOKIE_NAME = "newUser";
const COOKIE_ERROR = 'error';
const COOKIE_REGISTER = 'error';
const COOKIE_MAX_AGE = 30 * 1000;


/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLoginPage = (req, res) => {
    renderLogin(req, res);
}

/**
 * getRegister - handle the get request for the register page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRegisterPage = (req, res) => {
    try {
        const data = getCookieData(req);
        renderRegister(req, res, data);
    }
    catch{
        renderRegister(req, res);
    }
}

/**
 * getRegisterPasswords - handle the get request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRegisterPasswordsPage = (req, res) => {
    const cookieData = getCookie(req);
    if (!cookieData) res.redirect('/register');
    else renderRegisterPasswords(req, res);
}

/**
 * postLogin - handle the post request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.postLoginPage = (req, res) => {
    const {password, confirmPassword} = req.body;

    if (password === confirmPassword)
        registerUser(password, req, res);

    else {
        res.cookie(COOKIE_ERROR, 'passwords do not match');
        res.redirect('/register-passwords')
    }
};


/**
 * postRegisterPasswords - handle the post request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.postRegisterPasswords = async (req, res) => {
    const {email, firstName, lastName} = req.body;

    try {
        const emailExists = await db.User.findOne({where: { email } });

        if (emailExists) throw new Error('Email already in use');
        else setNewUserCookie(req, res, {email, firstName, lastName});
    }
    catch (error) {
        res.cookie(COOKIE_ERROR, error.message);
        res.redirect('/register');
    }
};


/**
 * logIn - logs in a user and renders the api page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logIn = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await db.User.findOne({where: {email}});
        if(!user) throw new Error("email is not found, please register")
        user.comparePasswords(password);
        renderApi(res);
    }
    catch(error){
        res.cookie(COOKIE_ERROR, error.message);
        res.redirect('/');
    }
}


/**
 * setNewUserCookie - sets a new user cookie with the provided data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} data - the data to be stored in the cookie
 */
const setNewUserCookie = (req, res, data) => {
    res.cookie(COOKIE_NAME, JSON.stringify(data), { maxAge: COOKIE_MAX_AGE });
    renderRegisterPasswords(req, res);
}

/**
 * getCookie - gets the data stored in the user cookie as string
 * @param {Object} req - Express request object
 * @returns {Object} the data stored in the cookie
 */
const getCookie = (req) => {
    return req.cookies[COOKIE_NAME];
}


/**
 * getCookieData - gets the data stored in the user cookie as string
 * @param {Object} req - Express request object
 * @returns {Object} the data stored in the cookie
 */
const getCookieData = (req) => {
    const cookie = getCookie(req);
    if(cookie) return JSON.parse(cookie);
    throw new Error("your time expired")
}


/**
 * createUser - enters a new user to the database
 * @param {String} firstName - user first name
 * @param {String} lastName - user last name
 * @param {String} email - user email
 * @param {String} password - user password
 * @param {Object} res - Express response object
 */
const createUser = (firstName, lastName, email, password, res) => {
    db.User.create({ firstName, lastName, email, password})
        .then(() => res.cookie('register', "New user was registered successfully!"))
        .catch((error) => {
            if (error instanceof Sequelize.ValidationError) {
                res.cookie(COOKIE_ERROR, error.message);
                res.cookie('register', 'working');
                throw error;
            }
            else res.render('error', {error: error});
        })
}


/**
 * registerUser - registers a new user
 * @param {string} password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function registerUser(password, req, res){
    try{
        const {email, firstName, lastName} = getCookieData(req);
        createUser(firstName, lastName, email, password, res);
        res.redirect('/');
    }
    catch(error){
        res.cookie(COOKIE_ERROR, error.message);
        res.redirect('/register');
    }
}


function getCookieError(req, res, key){
    const text =req.cookies[COOKIE_ERROR];
    res.clearCookie(COOKIE_ERROR);
    return text;
}
function getCookieText(req, res, key){
    const text=req.cookies['register'];
    res.clearCookie('register');
    return text;
}

//--- RENDER FUNCTIONS ----//
/**
 * renderLogin - displays the login page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param text
 */
function renderLogin(req, res){
    res.render('login', {title: 'Login', newRegistered: getCookieError(req,res,COOKIE_ERROR) || getCookieText(req,res,COOKIE_REGISTER)});
}


/**
 * renderRegister - displays the register page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param {User} userObj - User object
 */
function renderRegister(req, res, userObj=undefined){

    const {email, firstName, lastName} = userObj || {undefined,undefined,undefined}
    res.render('register', {title:'register', error:getCookieError(req,res,COOKIE_ERROR), email, firstName, lastName});
}


/**
 * renderRegisterPasswords - displays the register-passwords page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 */
function renderRegisterPasswords(req, res){
    res.render('register-passwords', {title: 'register-passwords', error:getCookieError(req,res,COOKIE_ERROR)});
}


/**
 * renderApi - renders the api page
 * @param {Object} res - Express response object
 */
function renderApi(res){
    res.render('api', {title: 'api'});
}