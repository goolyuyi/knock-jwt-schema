let express = require('express');
let cookieParser = require('cookie-parser');
let app = express();
let {UnauthorizedError} = require('knock-knock');

app.use(express.json());
app.use(cookieParser());

let knockKnock = require('knock-knock')({throwUnauthorizedError: true});

knockKnock.enable('test-jwt', require('../jwt-schema')({secret: 'top-secret'}), true);
knockKnock.enable('mock-login', require('knock-knock/mock-login-schema'), true);

app.all('/login', knockKnock.login(), (req, res, next) => {
    if (!res.headersSent) {
        res.send('okay');
    }
});

app.get('/dashboard', knockKnock.auth(), (req, res, next) => {
    if (req.user) {
        res.send(req.user);
    }
});

app.use(function (err, req, res, next) {

    if (err instanceof UnauthorizedError) {
        console.error(err);
        res.status(err.status).send('knock-knock error');
    } else {
        res.status(500).send('interal error');
    }
})

module.exports = app;
