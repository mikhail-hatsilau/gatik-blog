const { Strategy } = require('passport-local');
const { createHash } = require('crypto');
const nconf = require('../config');
const { User } = require('../schemas');

const strategy = new Strategy((username, password, done) => {
    console.log(username);

    const md5Crypto = createHash('md5');
    md5Crypto.update(password);
    const encryptedPass = md5Crypto.digest('hex');

    User.findOne({ username }, (err, user) => {
        if (err) {
            throw new Error(err);
        }

        if (user) {
            if (user.password === encryptedPass) {
                return done(null, {
                    id: user._id,
                    username: user.username
                });
            }
            return done(new Error('Password is incorrect'), null);
        }

        done(new Error('Login is incorrect'), null);
    });
});

module.exports = strategy;