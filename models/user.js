module.exports = class User {
    constructor(email, firstName, lastName, password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }
}