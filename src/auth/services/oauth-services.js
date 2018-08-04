var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var userRepository = require('../repositories/users');
var accessTokenRepository = require('../repositories/oauth-access-tokens');

passport.use(new LocalStrategy(
    function(username, password, done) {
        userRepository.findByUsername(username, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            let match = bcrypt.compareSync(password, user.password);
            if(match){
                    let myJWT = jwt.sign({ username }, 'blogdev.vn');
                    accessTokenRepository.createToken(myJWT, user.id, 'all', function(err, token){
                            if(err) done(err);
                            if(!token) return done(null, false);
                            return done(null, token);
                    })
                    
            }else{
                    console.log('faild');
                    return done(null, false);
            }
      });
})
);

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     userRepository.findById(id, function (err, user) {
//       if (err) { return done(err); }
//       done(null, user);
//     });
// });

passport.use(new BearerStrategy(
    function(token, done) {
        accessTokenRepository.findByToken(token, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, true, { scope: 'all' });
      });
    }
  ));

module.exports = passport;