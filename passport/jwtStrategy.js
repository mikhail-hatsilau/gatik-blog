const passportJWT = require('passport-jwt');
const nconf = require('../config');
const { User } = require('../schemas');

const params = {
    secretOrKey: nconf.get('jwt').secret,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeader()
};

const strategy = new passportJWT.Strategy(params, (payload, done) => {
    User.findOne({ _id: payload.id }, (err, user) => {
        if (err) {
            throw new Error(err);
        }

        if (user) {
            return done(null, user);
        }

        done(new Error('User not found'), null);
    });
});

module.exports = strategy;