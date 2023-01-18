const Cookies = require('cookies');
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
exports.getLogin = (req, res) => {
    renderLogin(res, false);
}

/**
 * getRegister - handle the get request for the register page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRegister = (req, res) => {
    renderRegister(res);
}

/**
 * getRegisterPasswords - handle the get request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRegisterPasswords = (req, res) => {
    const cookieData = getCookieData(req, res);
    if (!cookieData) res.redirect('/register');
    else renderRegisterPasswords(res);
}

/**
 * postLogin - handle the post request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.postLogin = (req, res) => {
    const {password, confirmPassword} = req.body;

    if (password === confirmPassword) {
        let data = getCookieData(req, res);
        const {email, firstName, lastName} = JSON.parse(data);
        enterUser(firstName, lastName, email, password, res);
    }

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
    catch (err) {
        res.render('error', {error: err});
    }
};

/**
 * setNewUserCookie - sets a new user cookie with the provided data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} data - the data to be stored in the cookie
 */
const setNewUserCookie = (req, res, data) => {
    const cookies = new Cookies(req, res);
    cookies.set(COOKIE_NAME, JSON.stringify(data), {maxAge: COOKIE_MAX_AGE});
    renderRegisterPasswords(res);
}

/**
 * getCookieData - gets the data stored in the user cookie
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} the data stored in the cookie
 */
const getCookieData = (req, res) => {
    const cookies = new Cookies(req, res);
    return cookies.get(COOKIE_NAME);
}

/**
 * enterUser - enters a new user to the database
 * @param {String} firstName - user first name
 * @param {String} lastName - user last name
 * @param {String} email - user email
 * @param {String} password - user password
 * @param {Object} res - Express response object
 */
const enterUser = (firstName, lastName, email, password, res) => {

    let user = db.User.build({ firstName, lastName, password, email});

    user.save()
        .then(() => renderLogin(res, true))
        .catch((err) => {
            if (err instanceof Sequelize.ValidationError)
                renderRegisterPasswords(res, err);
            else res.render('error', {error: err});
        })
}

/**
 * renderLogin - displays the login page.
 * @param {Object} res - Express response object
 * @param {Boolean} isNewRegistered - indicate if new user was registered successfully
 */
function renderLogin(res, isNewRegistered){
    const text = isNewRegistered ? "New user was registered successfully!" : "";
    res.render('login', {title: 'Login', newRegistered: text});
}

/**
 * renderRegister - displays the register page.
 * @param {Object} res - Express response object
 * @param {String} errorText - error message to be displayed on the page
 */
function renderRegister(res, errorText = ""){
    res.render('register', {title: 'register', error: errorText});
}

/**
 * renderRegisterPasswords - displays the register-passwords page.
 * @param {Object} res - Express response object
 * @param {String} errorText - error message to be displayed on the page
 */
function renderRegisterPasswords(res, errorText = ""){
    res.render('register-passwords', {title: 'register-passwords', error: errorText});
}