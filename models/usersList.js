// use the module pattern to handle a list of contacts
module.exports = (function() {
    // private data
    let users = [];

    function isNewUser(emailId){
        const found =  users.find((user) =>  {return user.email == emailId}) ;
        return !found;
    }

    function enterUser(user){
        users.push(user);
    }

    // public API
    return {
        isNewUser : isNewUser,
        enterUser : enterUser,
        getUsers: () => users,
    };
})();