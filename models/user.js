'use strict';

const {Model, Error} = require('sequelize');
const bcrypt = require('bcrypt');
const ROUNDS = 10; //define the complexity of the encryption

/**
 * Exports a function that defines the User model. This function is called by the models/register.js file
 * and is used to define the User model and its fields.
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The data types used by Sequelize.
 * @returns {Object} The User model.
 */
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations. The `models/index` file will call this.
         * method automatically.
         * @param {Object} models - The models object that contains all the defined models.
         */
        static associate(models) {
        }


    }

    User.init({
        firstName: {
            type: DataTypes.STRING,
            trim: true,
        },
        lastName: {
            type: DataTypes.STRING,
            trim: true,
        },
        email: {
            type: DataTypes.STRING,
            trim: true,
            unique: {args: true, msg: "Email already exists"}
        },
        password: {
            type: DataTypes.STRING,
        }
    }, {
        sequelize,
        modelName: 'User',
    });

    /**
     * Add a hook that runs before creating or updating a user
     * and encrypts the user's password.
     */
    User.addHook('beforeCreate', 'beforeUpdate', encryptPassword);


    /**
     * displays the add product page that includes a form.
     * @param req
     * @param res
     * @param next
     */
    sequelize.addHook('beforeValidate', (user) => {
        user.firstName = user.firstName.toLowerCase();
        user.lastName = user.lastName.toLowerCase();
    });

    /**
     * Encrypt the user's password using bcrypt.
     * @param {Object} user - The user object to encrypt the password for.
     */
    async function encryptPassword(user) {
        user.password = await bcrypt.hash(user.password, ROUNDS)
    }

    /**
     * Compare the user's entered password to the one stored in the database.
     * @param {String} tryPassword - The entered password to compare.
     * @throws {Error} If the passwords do not match.
     * @returns {Boolean} true if the passwords match.
     */
    User.prototype.comparePasswords = function(tryPassword) {
        const isMatch = bcrypt.compareSync(tryPassword, this.password);
        if (!isMatch) throw new Error("Incorrect password");
    }

    return User;
};