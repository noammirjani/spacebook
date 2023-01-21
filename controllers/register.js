const db = require('../models');
const Sequelize = require('sequelize');

//const variables
const COOKIE_NAME = "newUser";
const COOKIE_MAX_AGE = 30 * 1000;
const COOKIE_ERROR = 'error';
const COOKIE_REGISTER = 'register';


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
 * @param {Object} res - Express response object
 */
exports.getRegisterPasswordsPage = (req, res) => {
    try {
        getCookieData(req);
        renderRegisterPasswords(req, res);
    }
    catch{
        res.redirect('/register');
    }
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
    let {email, firstName, lastName} = req.body;

    try {
        email = email.toLowerCase();
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
 * getCookieData - gets the data stored in the user cookie as string
 * @param {Object} req - Express request object
 * @returns {Object} the data stored in the cookie
 */
const getCookieData = (req) => {
    const cookie = req.cookies[COOKIE_NAME];
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
const createUser = async (firstName, lastName, email, password, res) => {
    try {
        await db.User.create({ firstName, lastName, email, password});
        res.cookie(COOKIE_REGISTER, "New user was registered successfully!");
        res.clearCookie(COOKIE_NAME);
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            throw error;
        } else {
            res.render('error', {error: error});
        }
    }
}


/**
 * registerUser - registers a new user
 * @param {string} password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerUser = async (password, req, res) => {
    try{
        const {email, firstName, lastName} = getCookieData(req);
        await createUser(firstName, lastName, email, password, res);
        res.redirect('/');
    }
    catch(error){
        res.cookie(COOKIE_ERROR, error.message);
        res.redirect('/register');
    }
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
 * renderRegister - displays the register page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param {User} userObj - User object
 */
function renderRegister(req, res, userObj=undefined){

    const {email, firstName, lastName} = userObj || {undefined,undefined,undefined}
    res.render('register', {title:'register', error:getCookieText(req,res,COOKIE_ERROR), email, firstName, lastName});
}


/**
 * renderRegisterPasswords - displays the register-passwords page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 */
function renderRegisterPasswords(req, res){
    res.render('register-passwords', {title: 'register-passwords', error:getCookieText(req,res,COOKIE_ERROR)});
}
