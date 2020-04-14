var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// các cài đặt cần thiết cho passport

app.use(session({
    secret: process.env.TOKEN_SECRET || 'a4f8071f-c873-4447-8ee323',
    cookie: { maxAge: 2628000000 },
    store: new (require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 27017, // optional
        db: 'diemdanh-app', // optional
        collection: 'sessions', // optional
        expire: 86400 // optional
    }),
    resave: true,
    saveUninitialized: true,
    unset: 'destroy',
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

require('./configs/passport')(passport); // pass passport for configuration
var configDB = require('./configs/database.js');

var connectOptions = {
  useNewUrlParser: true, 
  useUnifiedTopology: true,  
  useCreateIndex: true,
  useFindAndModify: false
};
mongoose.Promise = global.Promise;

mongoose.connect(configDB.url, connectOptions)
  .then(
  () => { 
    console.log('Connected to database');
  },
  err => { 
    console.log('Can\'t connect to database: '+err);
  }
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
