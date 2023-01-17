const express = require('express');
const Cookies = require('cookies');
const router = express.Router();

const Sequelize = require('sequelize');
const db = require('../models');

/* GET */
router.get('/', (req, res) => {
    res.render('login', {title: 'Login', newRegistered: ""});
});

router.get('/register', (req, res) => {
    res.render('register', {title: 'register', error: ""});
});

router.get('/register-passwords', (req, res) => {
    const cookies = new Cookies(req, res);
    const cookieData = cookies.get("newUser");
    if (!cookieData) {
        res.redirect('/register');
        return;
    }
    res.render('register-passwords', {title: 'register passwords', error: undefined});
});

/* POST */
router.post('/', (req, res) => {
    const {password, confirmPassword} = req.body;

    if (password !== confirmPassword) {
        res.render('register-passwords', {title: 'register-passwords', error: "passwords do not match"});
        return;
    }

    const cookies = new Cookies(req, res);
    const {email, firstName, lastName} = JSON.parse(cookies.get("newUser"));
    let newUser = db.User.build({firstName: firstName, lastName: lastName, email: email, password: password});

    return newUser.save()
        // db.enterUser(user);
        .then(() => res.render('login', {title: 'Login', newRegistered: "New user was registered successfully!"}))
        .catch((err) => {
            res.render('register-passwords', { title: 'register passwords', error: err});
        })
});

router.post('/register-passwords', async (req, res) => {
    const cookies = new Cookies(req, res);
    const {email, firstName, lastName} = req.body;

    try {
        const emailExists = await db.User.findOne({where: { email: email } });

        if (emailExists) {
            res.render('register', { title: 'register', error: 'Email already in use'});
        }
        else {
            const data = {email, firstName, lastName};
            cookies.set("newUser", JSON.stringify(data), {maxAge: 30 * 1000});
            res.render('register-passwords', { title: 'register passwords', error: undefined });
        }
    }
    catch (err) {
        res.render('error', {error: err});
    }
});

module.exports = router;