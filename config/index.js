const nconf = require('nconf');
const path = require('path');

if (process.env.NODE_ENV === 'test') {
    nconf.argv()
        .env()
        .file({ file: path.join(__dirname, 'testConfig.json') });
} else {
    nconf.argv()
        .env()
        .file({ file: path.join(__dirname, 'config.json') });
}

module.exports = nconf;