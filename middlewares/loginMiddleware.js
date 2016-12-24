const md5Crypto = require('crypto').createHash('md5');
const jwt = require('jwt-simple');
const nconf = require('../config');
const { User } = require('../schemas');

module.exports = (req, res, next) => {
    const { username, password } = req.body;
    md5Crypto.update(password);
    const encryptedPass = md5Crypto.digest('hash');

    User.findOne({ username }, (err, user) => {
        if (err) {
            throw new Error(err);
        }

        if (user) {
            if (user.password === encryptedPass) {
                const payload = {
                    id: user[_id]
                };
                return res.json({
                    token: jwt.encode(payload, nconf.get('jwt').secret)
                });
            }

            return res.json({
                message: 'Password is incorrect'
            });
        }

        res.json({
            message: 'User not found'
        });
    });
};