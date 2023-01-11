const express = require('express');
//const Cookies = require('cookies')
const router = express.Router();

// Optionally define keys to sign cookie values
// to prevent client tampering
//const keys = ['keyboard cat']

/* GET */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register' });
});

router.get('/register-passwords', function(req, res, next) {
  res.render('register-passwords', { title: 'register passwords', error: undefined});
});

/* POST */
router.post('/', (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password !== confirmPassword) {
    // Passwords do not match, refresh the page or display an error message
    res.render('register-passwords', {title: 'register passwords', error: "passwords do not match" });
  }

  //update userData

  // Passwords match, render the "/" page
  res.render('/', {title: 'Login' });
});

module.exports = router;




// router.get('/', function (req, res) {
//   const cookies = new Cookies(req, res, { keys: keys })
//
//   // Get the cookie
//   const lastVisit = cookies.get('LastVisit', { signed: true })
//
//   if (!lastVisit) {
//     // Set the cookie with expiration time 10 seconds (for testing)
//     cookies.set('LastVisit', new Date().toISOString(), { signed: true, maxAge: 10*1000 });
//     res.render('firstvisit', {title: 'Firt visit with cookie', firstvisit: true});
//   }
//   else
//     res.render('firstvisit', { title: 'Firt visit with cookie', firstvisit: false });
// });