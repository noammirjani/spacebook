const express = require('express');
const Cookies = require('cookies');
const router = express.Router();

const User = require('../models/user.js');
const db = require("../models/usersList.js");

const keys = ['key']

/* GET */
router.get('/', (req, res) => {
  res.render('login', { title: 'Login', newRegistered : "" });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'register', error: "" });
});

router.get('/register-passwords', (req, res) => {
  const cookies = new Cookies(req, res);
  const cookieData = cookies.get("newUser");
  if (!cookieData) {
    res.redirect('/register');
    return;
  }
  res.render('register-passwords', { title: 'register passwords', error: undefined});
});

/* POST */
router.post('/', (req, res) => {
  const {password, confirmPassword} = req.body;
  if (password !== confirmPassword) {
    res.render('register-passwords', {title: 'register-passwords', error: "passwords do not match" });
    return;
  }

  const cookies = new Cookies(req, res);
  const prevData = JSON.parse(cookies.get("newUser"));
  const user = new User(prevData.email, prevData.firstName, prevData.lastName, password);

  db.enterUser(user);
  res.render('login', {title: 'Login' , newRegistered : "you are registered"});
});

router.post('/register-passwords', (req, res) => {
  const cookies = new Cookies(req, res);
  const {email, firstName, lastName} = req.body;
  if (db.isNewUser(email)) {
    const data = { email, firstName, lastName };
    cookies.set("newUser", JSON.stringify(data), { maxAge: 30*1000 });
    res.render('register-passwords', { title: 'register passwords', error: undefined });
  } else {
    res.render('register', { title: 'register', error: 'Email already in use'});
  }
});

module.exports = router;
