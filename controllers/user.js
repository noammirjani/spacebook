const db = require('../models');
const Sequelize = require('sequelize');

//const variables
const COOKIE_NAME = "newUser";
const COOKIE_MAX_AGE = 30 * 1000;

/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLoginPage = (req, res) => {
    renderLogin(res, false);
}

/**
 * getRegister - handle the get request for the register page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRegisterPage = (req, res) => {
    try{
        const {email, firstName, lastName} = getCookieData(req);
        renderRegister(res, "", email, firstName, lastName );
    }
    catch(error){
        renderRegister(res, error.message);
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
    else renderRegisterPasswords(res);
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

    else renderRegisterPasswords(res, "passwords do not match");
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

        if (emailExists) renderRegister(res, 'Email already in use');
        else setNewUserCookie(req, res, {email, firstName, lastName});
    }
    catch (error) {
        res.render('error', {error: error.message});
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
        renderLogin(res, error.message);
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
    renderRegisterPasswords(res);
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
    if(!cookie) throw new Error("your time expired")
    return JSON.parse(cookie);
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
        .then(() => renderLogin(res, "New user was registered successfully!"))
        .catch((error) => {
            if (error instanceof Sequelize.ValidationError)
                renderRegister(res, "This email is already taken");
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
    }
    catch(error){
        renderRegister(res, error.message);
    }
}

                                //--- RENDER FUNCTIONS ----//
/**
 * renderLogin - displays the login page.
 * @param {Object} res - Express response object
 * @param text
 */
function renderLogin(res, text = ""){
    res.render('login', {title: 'Login', newRegistered: text});
}


/**
 * renderRegister - displays the register page.
 * @param {Object} res - Express response object
 * @param {String} errorText - error message to be displayed on the page
 * @param {String} email
 * @param {String} firstName
 * @param {String} lastName
 */
function renderRegister(res, errorText = "", email="", firstName="",lastName=""){
    res.render('register', {title: 'register', error: errorText, email, firstName, lastName});
}


/**
 * renderRegisterPasswords - displays the register-passwords page.
 * @param {Object} res - Express response object
 * @param {String} errorText - error message to be displayed on the page
 */
function renderRegisterPasswords(res, errorText = ""){
    res.render('register-passwords', {title: 'register-passwords', error: errorText});
}


/**
 * renderApi - renders the api page
 * @param {Object} res - Express response object
 */
function renderApi(res){
    res.render('api', {title: 'api'});
}