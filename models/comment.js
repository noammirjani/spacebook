module.exports = class Comment {
    constructor(id, userName, commentTxt) {
        this.id = id;
        this.commentTxt = commentTxt;
        this.userName = userName;
    }
};