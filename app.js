const express = require('express');
const mongoose = require('mongoose');

// accès mongoDB
const mongodbClient = {
    username: 'piiquante-user',
    password:
        '73pu2zEfKZ34cSJiU352vxJSHF5PqzfkaDva6RaEdu5Ew9T6H6j8Eb7Yqqr7sgNf9GakZK',
};
const uri = `mongodb+srv://${mongodbClient.username}:${mongodbClient.password}@piiquante-api.mongodb.net/piiquante-api?retryWrites=true&w=majority`;
try {
    mongoose.connect(uri, () => {
        console.log('MongoDB is connected !');
    });
} catch (error) {
    console.error('MongoDB not connected !');
}

//initialisation d'express
const app = express();
app.use(express.json());

module.exports = app;
