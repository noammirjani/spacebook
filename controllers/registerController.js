const db = require("../models");
const cookies = require("./cookiesHandler");
const access = require("./checkAccess");

//const variables
const COOKIE_ERROR = "error";
const COOKIE_REGISTER = "register";
const COOKIE_USER = "newUser";
const COOKIE_MAX_AGE = 30 * 1000;
const UNIQUE_MAIL = "Email already exists";


/**
 * enterToRegisterPage - handle the get request for the register page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.enterToRegisterPage = (req, res) => {
	try {
		//display with user data
		const data = cookies.getCookieData(req, COOKIE_USER);
		renderRegister(req, res, data);
	} catch {
		//display without user data
		renderRegister(req, res);
	}
};

/**
 * enterRegisterPasswordsPage - handle the get request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} res - Express response object
 */
exports.getRegisterPasswordsPage = (req, res) => {
	checkTimeExpiredAndRender(req, res);
};


/**
 *  A function that checks if the time on a user's cookie has expired and renders the appropriate page.
 *  @function checkTimeExpiredAndRender
 *   @param {Object} req - The request object from the client.
 *  @param {Object} res - The response object to be sent to the client.
 *  @param {string} [errMsg] - An optional error message to be displayed on the rendered page.
 */
function checkTimeExpiredAndRender(req, res, errMsg = undefined) {
	//if there is access but the email didn't catch by faster user
	if (cookies.isCookieExists(req, COOKIE_USER)){
		if(errMsg !== UNIQUE_MAIL)
			renderRegisterPasswords(req, res, errMsg);
		else {
			res.cookie(COOKIE_ERROR, UNIQUE_MAIL);
			res.redirect("/register");
		}
	}
	else {
		if (cookies.isCookieExists(req, COOKIE_ERROR) || errMsg)
			res.cookie(COOKIE_ERROR, "your time expired");
		res.redirect("/register");
	}
}


/**
 * postLogin - handle the post request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.userEnteredPasswords = (req, res) => {
	const {password, confirmPassword} = req.body;

	if (password === confirmPassword) {
		registerNewUser(password, req, res).then();
	} else {
		checkTimeExpiredAndRender(req, res, "passwords do not match");
	}
};


/**
 * enterRegisterPasswords - handle the post request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.userBaseDataEntered = async (req, res) => {
	try {
		let { email, firstName, lastName } = getDataFromRequest(req);
		//access.SequelizeUsersTableValidAccess();

		const emailExists = await db.User.findOne({ where: { email: email.toLowerCase() } });
		if (emailExists) {
			throw new Error("Email already in use");
		}

		setNewUserCookie(req, res, { email, firstName, lastName });
		res.redirect("/register/register-passwords");
	}
	catch (error) {
		renderRegister(req, res, undefined, access.SequelizeFatalError(error) || error.message);
	}
};


/**
 * getDataFromRequest -get data from the body request, trim the data.
 * @param {Object} req - Express request object
 */
function getDataFromRequest(req){
	let { email, firstName, lastName } = req.body;

	email = email.trim();
	firstName = firstName.trim();
	lastName = lastName.trim();

	return {email, firstName, lastName };
}


/**
 * setNewUserCookie - sets a new user cookie with the provided data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} data - the data to be stored in the cookie
 */
const setNewUserCookie = (req, res, data) => {
	res.cookie(COOKIE_USER, JSON.stringify(data), { maxAge: COOKIE_MAX_AGE });
};


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
		email = email.toLowerCase();
		firstName = firstName.toLowerCase();
		lastName = lastName.toLowerCase();

		await db.User.create({ firstName, lastName, email, password });
		res.cookie(COOKIE_REGISTER, "New user was registered successfully!");
		res.clearCookie(COOKIE_USER);
	}
	catch (error) {
		//update the error msg, if its equalized validation, security or other
		error.message = access.SequelizeFatalError(error) || error.message;
		throw error;
	}
};


/**
 * registerNewUser - registers a new user
 * @param {string} password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerNewUser = async (password, req, res) => {
	try {
		let { email, firstName, lastName } = cookies.getCookieData(req, COOKIE_USER);
		await createUser(firstName, lastName, email, password, res);
		res.redirect("/");
	}
	catch (error) {
		checkTimeExpiredAndRender(req, res, error.message);
	}
};


//--- RENDER FUNCTIONS ----//
/**
 * renderRegister - displays the register page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param {User} userObj - User object
 * @param errMsg
 */
function renderRegister(req, res, userObj = undefined, errMsg = undefined) {
	if (errMsg) cookies.clear(req, res, COOKIE_ERROR);
	const { email, firstName, lastName } = userObj || { undefined };

	res.render("register", {
		title: "register",
		error: errMsg || cookies.getCookieText(req, res, COOKIE_ERROR),
		email, firstName, lastName,
	});
}


/**
 * renderRegisterPasswords - displays the register-passwords page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param errMsg
 */
function renderRegisterPasswords(req, res, errMsg = undefined) {
	if (errMsg) {
		cookies.clear(req, res, COOKIE_ERROR);
	}

	res.render("register-passwords", {
		title: "register-passwords",
		error: errMsg || cookies.getCookieText(req, res, COOKIE_ERROR) || "",
	});
}


/**
 * Handle an error when trying to enter a page
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.errorEnter = (req, res) => {
	res.cookie(COOKIE_ERROR, "post to page register, unpredictable act!!");
	renderRegister(req, res);
};
