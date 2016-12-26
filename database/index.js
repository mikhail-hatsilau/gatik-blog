const mongoose = require('mongoose');
const nconf = require('../config');
const Promise = require('bluebird');

mongoose.Promise = Promise;

mongoose.connect(nconf.get('database').url);

module.exports = mongoose;