const { Strategy } = require('passport-local');
const { createHash } = require('crypto');
const { User } = require('../schemas');

const strategy = new Strategy((username, password, done) => {
    const encryptedPass = createHash('md5').update(password).digest('hex');

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
            return done(null, false, { message: 'Password is incorrect' });
        }

        return done(null, false, { message: 'Username is incorrect' });
    });
});

module.exports = strategy;