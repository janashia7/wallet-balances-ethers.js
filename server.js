const express = require('express');
const getBalance = require('./src/controller/getBalance');

const balance = require('./src/router/balance');

const app = express();

app.get("/", getBalance);

app.listen(5000, () => console.log('running'));
