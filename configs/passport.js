var LocalStrategy = require('passport-local').Strategy;

var passport = require('passport');

var Account = require('../models/accounts');

module.exports = function (passport) {
    
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    Account.findById(id, function (err, acc) {
      if(acc)return done(err, acc);
    });
  });
  
  passport.use('local-create-account', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true 
    },
    function (req, username, password, done) {
      process.nextTick(function () {
        Account.findOne({username: username}, async function (err, accCheckLocal) {
          if (err) return done(err);
          if (accCheckLocal)  return done(null, false, req.flash('mess', 'Tên đăng nhập đã được sử dụng'));
          else {
            var newAccount = new Account();
            newAccount.username = username;
            newAccount.password = newAccount.encryptPassword(password);
            newAccount.name = req.body.name;
            // lưu vào db
            newAccount.save(function (err) {
              if (err) throw err;
              return done(null, newAccount, req.flash('mess', 'Tạo tài khoản thành công!'));
            });
          }
        });
      });
    })
  );
};

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, username, password, done) { 
  Account.findOne({'username': username}, function (err, user) {
    //console.log('Lỗi: '+user);
    if (err)  return done(err);
    if (!user) return done(null, false, req.flash('mess', 'Tài khoản không tồn tại'));
    if (!user.validPassword(password)) return done(null, false, req.flash('mess', 'Mật khẩu không chính xác'));
    return done(null, user);
  })}
));
