'use strict';
var util = require('util');
var redisNewUser = require('../../config/redis-client')();
var redis = redisNewUser.client
var commands = redisNewUser.commands.reduce( (o,x) => { o[x] = util.promisify(redis[x]).bind(redis); return o }, {} )
const auth = require('../helpers/auth')

module.exports = {
    addTenant: addTenant
  };

async function addTenant(args,res) {
    if (!args.body.domain) {
        var response = "{ message: 'Error: No params' }";
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(response);
    } else {
        const domain = args.body.domain;
      
        if ( typeof domain == 'string') {  // check types
          const domainExists = await commands.sismember('tenants',domain)
          if (domainExists) {
            response = '{ "status": "tenant already exists" }'
          } else {
            commands.sadd('tenants', domain)
            response = `{ "status": "tenant created" }`
          }
          return res.status(200).end(response);
        }  else {
          var response = '{ message: "Error: Wrong parameters" }';
        //   res.writeHead(403, { "Content-Type": "application/json" });
          return res.status(403).end(response);
        }
    }
}