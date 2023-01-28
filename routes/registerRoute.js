const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");


/* GET */
/**
 * Renders the registration page.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/", registerController.enterToRegisterPage);

/**
 * Renders the registration password page.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/register-passwords", registerController.getRegisterPasswordsPage);


/* POST */
/**
 * Handles an error in the registration process.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/", registerController.errorEnter); //is not suppose to happened though

/**
 * Handles the submission of basic user information during registration.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/register-passwords", registerController.userBaseDataEntered);

/**
 * Handles the submission of user password during registration.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/user-password", registerController.userEnteredPasswords);

module.exports = router;
