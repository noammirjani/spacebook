const db = require("../models");
const cookies = require("./cookies");
const Sequelize = require("sequelize");

//const variables
const COOKIE_ERROR = "error";
const COOKIE_REGISTER = "register";
const COOKIE_USER = "newUser";
const COOKIE_MAX_AGE = 30 * 1000;

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

function checkTimeExpiredAndRender(req, res, errMsg = undefined) {
	if (cookies.isCookieExists(req, COOKIE_USER)) renderRegisterPasswords(req, res, errMsg);
	else {
		if (cookies.isCookieExists(req, COOKIE_ERROR) || errMsg) res.cookie(COOKIE_ERROR, "your time expired");

		res.redirect("/register");
	}
}

/**
 * postLogin - handle the post request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.userEnteredPasswords = (req, res) => {
	const { password, confirmPassword } = req.body;

	if (password === confirmPassword) registerNewUser(password, req, res).then();
	else {
		checkTimeExpiredAndRender(req, res, "passwords do not match");
	}
};

/**
 * enterRegisterPasswords - handle the post request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.userBaseDataEntered = async (req, res) => {
	let { email, firstName, lastName } = req.body;

	try {
		const emailExists = await db.User.findOne({ where: { email: email.toLowerCase() } });

		if (emailExists) throw new Error("Email already in use");
		setNewUserCookie(req, res, { email, firstName, lastName });
		res.redirect("/register/register-passwords");
	} catch (error) {
		renderRegister(req, res, undefined, error.message);
	}
};

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
		await db.User.create({ firstName, lastName, email, password });
		res.cookie(COOKIE_REGISTER, "New user was registered successfully!");
		res.clearCookie(COOKIE_USER);
	} catch (error) {
		if (error instanceof Sequelize.ValidationError) throw error;
		else res.render("error", { error: error.msg });
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
	} catch (error) {
		checkTimeExpiredAndRender(req, res, error.message);
	}
};

//--- RENDER FUNCTIONS ----//
/**
 * renderRegister - displays the register page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param {User} userObj - User object
 */
function renderRegister(req, res, userObj = undefined, errMsg = undefined) {
	if (errMsg) cookies.clear(req, res, COOKIE_ERROR);

	const { email, firstName, lastName } = userObj || { undefined };
	res.render("register", {
		title: "register",
		error: errMsg || cookies.getCookieText(req, res, COOKIE_ERROR),
		email,
		firstName,
		lastName,
	});
}

/**
 * renderRegisterPasswords - displays the register-passwords page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 */
function renderRegisterPasswords(req, res, errMsg = undefined) {
	if (errMsg) cookies.clear(req, res, COOKIE_ERROR);

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
