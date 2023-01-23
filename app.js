let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let fs = require('fs')
const session = require('express-session');

let registerRouter = require('./routes/register'); //register
let loginRouter = require('./routes/login');       //login
let commentsRouter = require('./routes/comments'); //comments

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true
}));


app.use(loginRouter);
app.use(registerRouter);
app.use(commentsRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send("Oops, looks like you landed at the wrong URL!");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');// use a default error page error.ejs
});

module.exports = app;
