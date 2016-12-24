const jwtStrategy = require('./jwtStrategy');
const passport = require('passport');

passport.use(jwtStrategy);

module.exports = passport;