const express = require("express");
const apiController = require("../controllers/api");
const loginController = require("../controllers/login");
const router = express.Router();

//GET
router.get('/',
    apiController.getApp);

//LOGOUT FEED
router.get('/logout',
    apiController.logOut);

router.get('/comments',
    apiController.getComments);

router.get('/comments?date&lastPollTimestamp',
    apiController.pollComments);

//POST COMMENTS
router.post('/comments',
    apiController.postComment);

//DELETE COMMENTS
router.delete('/comments',
    apiController.deleteComment);


module.exports = router;