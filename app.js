const express = require('express');
const mongoose = require('mongoose');

const authRoute = require('./routes/auth');
const saucesRoute = require('./routes/sauces');

// accès mongoDB
const mongodbClient = {
    username: 'piiquante-user',
    password:
        '73pu2zEfKZ34cSJiU352vxJSHF5PqzfkaDva6RaEdu5Ew9T6H6j8Eb7Yqqr7sgNf9GakZK',
};
const uri = `mongodb+srv://${mongodbClient.username}:${mongodbClient.password}@piiquante-api.oyec8pr.mongodb.net/?retryWrites=true&w=majority`;

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB is connected !');
    })
    .catch(error => {
        console.error('MongoDB not connected !');
    });

//initialisation d'express
const app = express();
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/sauces', saucesRoute);

module.exports = app;
