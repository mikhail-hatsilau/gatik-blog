const mongoose = require('mongoose');
const nconf = require('../config');

console.log(nconf.get('database').url);
mongoose.connect(nconf.get('database').url);

module.exports = mongoose;