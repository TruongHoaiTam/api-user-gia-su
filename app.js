const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');

mongoose.connect(`mongodb+srv://Hatomia:hatomiatruong@user-gia-su-pmqxm.gcp.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

const port = process.env.PORT || '3000';

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

app.listen(port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", 'GET,HEAD,OPTIONS,POST,PUT');
    res.header("Access-Control-Allow-Headers", 'Origin, Access-Control-Allow-Methods, X-Requested-With, Content-Type, Accept, Authorization ');
    next();
});



app.use('/', require('./app/router/index'));

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;