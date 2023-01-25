const express = require("express");
const commentsController = require("../controllers/api");
const loginController = require("../controllers/login");
const router = express.Router();

//GET

router.get('/home',
    loginController.getApp);

//LOGOUT FEED
router.get('/home/logout',
    loginController.logOut);

router.get('/comments/:date',
    commentsController.getComments);

router.get('/comments?date&lastPollTimestamp',
    commentsController.pollComments);

//POST COMMENTS
router.post('/comments',
    commentsController.postComment);

//DELETE COMMENTS
router.delete('/comments',
    commentsController.deleteComment);


module.exports = router;