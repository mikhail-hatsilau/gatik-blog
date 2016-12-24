const mongoose = require('../database');
const { createHash } = require('crypto');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: String,
    last_name: String,
    role: String
});

UserSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    const md5Crypto = createHash('md5');
    md5Crypto.update(user.password);
    user.password = md5Crypto.digest('hex');
    next();
});

module.exports = mongoose.model('User', UserSchema);
