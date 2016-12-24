const express = require('express');
const session = require('express-session');
const uuid = require('node-uuid');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const nconf = require('./config');
const graffiti = require('@risingstack/graffiti');
const { getSchema } = require('@risingstack/graffiti-mongoose');
const { User, Article } = require('./schemas');
const passport = require('./passport');

const app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    genid(req) {
        return uuid.v4();
    },
    secret: nconf.get('session').secret,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({
        sessionId: req.sessionID
    });
});

app.use((req, res, next) => {
    if (!req.isAuthenticated()) {
        res.status = 401;
        res.json({
            message: 'Not authorized'
        });
        return;
    }
    next();
});


app.post('/logout', (req, res, next) => {
    req.logout();
    res.json({
        message: 'Logged out'
    });
});

app.use(graffiti.express({
    schema: getSchema([User, Article]),
    context: {}
}));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        message: err.message
    });
});

module.exports = app;
