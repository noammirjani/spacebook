const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");

/**
 * Render the login page
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/", loginController.renderLoginPage);

/**
 * Render the login page
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/login/submit", loginController.renderLoginPage);

/**
 * Handle the login form submission, check login credentials and redirect to homepage
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/login/submit", loginController.enterHomePage);

module.exports = router;
