let express      = require('express');
let path         = require('path');
let cookieParser = require('cookie-parser');
let logger       = require('morgan');
const session    = require('express-session');
let access       = require('./controllers/checkAccess');
let createError  = require('http-errors');
let fs           = require('fs');


let registerRouter = require('./routes/register'); //register
let loginRouter    = require('./routes/login');       //login
let apiRouter = require('./routes/api'); //comments


let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret:"somesecretkey",
  resave: false, // Force save of session for each request
  saveUninitialized: false, // Save a session that is new, but has not been modified
  cookie: {maxAge: 10*60*1000 } // milliseconds!
}));



const checkLogin = (req, res, next) => {
  console.log("111111111")
  if(req.session.isLoggedIn)
    next();
  else {
    if(!req.cookies.connect){
  //    res.cookie("error","please sign in");
      res.render('index', {
        title: 'Login',
        error: "please sign in",
        newRegistered:  ""});
    }
    else{
      text = {msg: "server is down, try again later"};
      res.status(401).json(text)
    }
  }
}
const checkLogout = (req,res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home")
  }
  else {
    next();
  }
}
const nocache = (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,max-age=0,s-maxage=0');
  next();
}

// Use middleware functions
app.use(nocache);
app.use('/home', checkLogin, apiRouter);
app.use('/', checkLogout, loginRouter);
app.use('/register', checkLogout, registerRouter);
// app.use('/login', checkLogout, loginRouter);

module.exports = app;


// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   res.status(404).send("Oops, looks like you landed at the wrong URL!");
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');// use a default error page error.ejs
// });