'use strict';
var util = require('util');
const salt = require('./hash-salt-library')
var redisNewUser = require('../../config/redis-client')();
var redis = redisNewUser.client
var commands = redisNewUser.commands.reduce( (o,x) => { o[x] = util.promisify(redis[x]).bind(redis); return o }, {} )
const auth = require('../helpers/auth')

module.exports = {
    login: login
  };

const roles = [ 'user', 'admin']

const schema = {
  username: 'string',
  password: 'string',
  role: 'string',
  domain: 'string'
}

const sMap = Object.entries(schema)

async function login(args, res) {
  const credentials = args.body
  console.log('login credentials', credentials)
  if (sMap.some( x => !credentials[x[0]])) {
      var response = `{ message: 'Error: No params' }`;
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(response);
  } else {
      const role = args.swagger.params.role.value;
      const username = credentials.username;
      const password = credentials.password;
      const domain = credentials.domain;
    
      if ( !roles.includes(role) ) {
        var response = "{ message: 'Error: No role' }";
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(response);
      } else
      if ( typeof username == 'string' && typeof password == 'string' && typeof domain == 'string'  && typeof role == 'string' ) {
        const hashedUser = await salt.hashString(domain+role+username).catch( err => console.log(err))
        const userToVerify = salt.toJSON(hashedUser)
        const userExists = await commands.hget('passwd',userToVerify)
        const toVerify = userExists ? salt.fromJSON(userExists) : null
        const userVerified = toVerify ? await salt.verifyHash(domain+role+username+password, toVerify).catch( err => console.log(err)) : null
        console.log('user verified', userVerified)
        if (userExists && userVerified && role) {
          var tokenString = auth.issueToken(username, role);
          var response = `{ "token": "Bearer ${tokenString}", "username": "${username}", "role": "${role}", "domain":"${domain}" }`;
          return res.status(200).end(response);
        } else {
          var response = '{ "message": "Error: Credentials incorrect" }';
          return res.status(403).end(response);
        }
      } else {
        console.log('types', username, password, domain)
        var response = '{ message: "Error: Bad type" }';
          return res.status(403).end(response);
      }

  }

};