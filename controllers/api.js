const db = require("../models");
const { Op } = require('sequelize');

exports.getComments = async(req, res) => {
  //  getCommentsByDate(req,res, req.params.date)

    date = req.query.date;

    try {
        const comments = await db.Comment.findAll({where: {date}});
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

async function getCommentsByDate(req, res, date){

}

exports.postComment = async(req, res) => {
    try {
        const {date, text} = req.body;
        const email = req.session.email;

        await db.Comment.create({ date, text, email});
        res.status(201).json({msg: "comment posted"});
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.deleteComment = async(req, res) => {
    try{
        const {date, id, text} = req.body;

        const comment = await db.Comment.findOne({ where: { id } })

        if(!comment) res.status(404).json({msg: "wanted comment to delete wasn't found"});

        if (comment.email!== req.session.email ||
            comment.text !== text ||
            comment.date !== date)
            res.status(404).json({msg: "wanted comment to delete wasn't found"});

        await comment.destroy();
        res.status(201).json({msg: "comment deleted"});
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.pollComments = async(req, res) => {
try {
    const date = req.query.date;
    const time = req.query.lastPollTimestamp;
    const user = req.query.email;

    const modify = await db.Comment.findAll({
        paranoid: false,
        force: true,
        where: {
            updatedAt: {[Op.gt]: time},
            date,
            email: {[Op.ne]: user}  // added condition
        }
    });

    if (modify.length > 0) {
        const comments = await db.Comment.findAll({where: {date}}) || [];
        res.status(200).json({
            isUpdate: true,
            comments: comments,
            updateTime: new Date().toUTCString().replace(/\([^()]*\)/g, ""),
            amount: modify.length
        });
    }
    else res.status(203).json({
        isUpdate: false,
        comments: [],
        updateTime: time,
        amount: 0
    });
}
    catch(error){
        res.status(500).json("Error polling comments");
    }
}

/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getApp = (req, res) => {

    res.render('home', {
        title: 'api',
        name:req.session.userName,
        email:req.session.email
    })
}

exports.logOut = (req, res) => {
    req.session.isLoggedIn = false;
    res.redirect('/');
}