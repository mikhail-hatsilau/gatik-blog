const localStrategy = require('./localStrategy');
const passport = require('passport');

passport.use(localStrategy);

passport.serializeUser((user, done) => {
    done(null, JSON.stringify(user));
});

passport.deserializeUser((user, done) => {
    done(null, JSON.parse(user));
});

module.exports = passport;