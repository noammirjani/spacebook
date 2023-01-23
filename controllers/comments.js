const db = require("../models");

exports.getComments = async(req, res) => {
    try {
        const date = req.params.date;
        const commentsOnImage = await db.Comment.findAll({ where: { date } }) || [];
        res.status(200).json(commentsOnImage);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.postComment = async(req, res) => {
    try {
        const {date, text} = req.body;
        const email = req.session.email;

        const comment = await db.Comment.create({ date, text, email});
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.deleteComment = async(req, res) => {
    try{
        const {date, id, text} = req.body;

        const comment = await db.Comment.findOne({ where: { id } })

        if(!comment) res.status(404).json("wanted comment to delete wasn't found");

        if (comment.email!== req.session.email ||
            comment.text !== text ||
            comment.date !== date)
            res.status(404).json("wanted comment to delete wasn't found");

        await comment.destroy();
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}