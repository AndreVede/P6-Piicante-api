const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const authRoute = require('./routes/auth');
const saucesRoute = require('./routes/sauces');

// accès mongoDB
const uri = `mongodb+srv://${process.env.MONGO_CLIENT_USERNAME}:${process.env.MONGO_CLIENT_PASSWORD}@piiquante-api.oyec8pr.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', true);
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('>>>> MongoDB is connected ! <<<<');
    })
    .catch(error => {
        console.error('>>>> MongoDB not connected ! <<<<');
    });

//initialisation d'express
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/sauces', saucesRoute);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
