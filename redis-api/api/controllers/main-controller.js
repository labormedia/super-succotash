'use strict';
var util = require('util');
var crud = require('../../config/redis-client')();
const auth = require('../helpers/auth')

module.exports = {
    ping: ping
  };

function ping(req, res) {
    res.json({ message: `${Math.random(1000)}`});
}