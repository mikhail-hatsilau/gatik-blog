const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const nconf = require('./config');
const graffiti = require('@risingstack/graffiti');
const {getSchema} = require('@risingstack/graffiti-mongoose');
const {User} = require('./schemas');
const { loginMiddleware } = require('./middlewares');
const passport = require('./passport');

const app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

passport.initialize();

app.post('/login', loginMiddleware);

app.use(passport.authenticate('jwt', nconf.get('jwt').sessionInfo), graffiti.express({
    schema: getSchema([User]),
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
