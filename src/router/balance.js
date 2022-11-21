const express = require('express');
const getBalance = require('../controller/getBalance');
const router = express.Router();

router.get('/', getBalance);

module.exports = router;
