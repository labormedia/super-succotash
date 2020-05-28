'use strict';
const util = require('util');
var Stream = require('stream')
const salt = require('./hash-salt-library')
const redisNewUser = require('../../config/redis-client')();
const redis = redisNewUser.client
const commands = redisNewUser.commands.reduce( (o,x) => { o[x] = util.promisify(redis[x]).bind(redis); return o }, {} )
const auth = require('../helpers/auth')

const superduperverylongsalt = 'cat'
const roles = ['user', 'admin']
const userAttributes = ['profile', 'rooms']

module.exports = {
    addUser: addUser,
    removeUser: removeUser,
    updateUser: updateUser,
    getAttribute: getAttribute
  };

const schema = {
    username: 'string',
    password: 'string',
    role: 'string',
    domain: 'string'
}
const sMap = Object.entries(schema)

async function addUser(args,res) {
    const credentials = args.body
    console.log('add user credentials', credentials, !credentials.user)
    if (sMap.some( x => !credentials[x[0]])) {
        console.log('wrong parameters', args.body)
        var response = "{ message: 'Error: Missing params' }";
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(response);
    } else {

        const role = credentials.role;
        const username = credentials.username;
        const password = credentials.password;
        const domain = credentials.domain;
        // const domain = args.body.password
      
        if (!roles.includes(role)) {
          var response = `{ message: 'Error: No role' }`;
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(response);
        } else

        if ( sMap.find( x => typeof credentials[x[0]] == x[1] ) ) {  // check types
            const hashedUser = await salt.hashString(domain+role+username).catch( err => console.log(err))
            const userToSave = salt.toJSON(hashedUser)
            const userMD5 = salt.md5(domain+username)
            const domainExists = await commands.sismember('tenants',domain)
            const userExists = domainExists ? await commands.hget('passwd',userToSave) : domainExists
            console.log('user exists ?', userExists)
            if (domainExists && !userExists ) {
                var tokenString = auth.issueToken(username, role);
                const hashedPassword = await salt.hashRandomString(domain+role+username+password).catch( err => console.log(err))
                const passToSave = salt.toJSON( hashedPassword)
                const userHashes = await commands.hset('passwd', userToSave, passToSave)
                const userProfile = await commands.hmset([userMD5,'profile'].join(':'), 'username', user, 'domain', domain, 'role',role, 'md5', userMD5,'hash:rooms', [userMD5,'rooms'].join(':'))
                console.log('add user operation:', userHashes)
                var response = `{ "status": "user created","token": "Bearer ${tokenString}", "username": "${username}", "role": "${role}", "domain":${domain} }`
                return res.status(200).end(response);
            } else 
            if (!domainExists) {
                var response = '{ "status": "domain does not exist or null" }'
                return res.status(200).end(response);
            } else {
                var response = '{ "status": "user already exists" }'
                return res.status(200).end(response);
            }
        } else {
          var response = '{ message: "Error: Credentials incorrect" }';
          return res.status(403).end(response);
        }
    }
}

async function removeUser(args,res) {
    const credentials = args.body
    if (!credentials.role && !credentials.user && !credentials.domain) {
        console.log('wrong parameters', args.body)
        var response = "{ message: 'Error: No params' }";
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(response);
    } else {

        const role = credentials.role;
        const username = credentials.username;
        const password = credentials.password;
        const domain = credentials.domain;
        // const domain = args.body.password
      
        if (role != "user" && role != "admin") {
          var response = { message: 'Error: No role' };
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(response);
        }

        if ( typeof username == 'string' && typeof role == 'string' && typeof domain == 'string') {  // check types
            const hashedUser = await salt.hashString(domain+role+username).catch( err => console.log(err))
            const userToSave = salt.toJSON( hashedUser )
            const domainExists = await commands.sismember('tenants',domain)
            const userExists = domainExists ? await commands.hget('passwd',userToSave) : domainExists
            console.log('user exists ?', userExists)
            if (domainExists && userExists ) {
                var tokenString = auth.issueToken(username, role);
                // const hashedPassword = await salt.hashRandomString(domain+role+username+password).catch( err => console.log(err))
                const userHashes = await commands.hdel('passwd', userToSave)
                console.log('remove user operation:', userHashes)
                var response = `{ "status": "user removed","token": "Bearer ${tokenString}", "username": "${username}", "role": "${role}", "domain":${domain} }`
                return res.status(200).end(response);
            } else 
            if (!domainExists) {
                var response = '{ "status": "domain does not exist or null" }'
                return res.status(200).end(response);
            } else {
                var response = '{ "status": "user does not exists" }'
                return res.status(200).end(response);
            }
        } else {
          var response = '{ message: "Error: User metadata incorrect" }';
        //   res.writeHead(403, { "Content-Type": "application/json" });
          return res.status(403).end(response);
        }
    }
}

function updateUser(args,res) {
    const callback = async (args, res) => {
        const credentials = args.body

        const role = credentials.role;
        const username = credentials.username;
        const password = credentials.password;
        const domain = credentials.domain;

        const hashedUser = await salt.hashString(domain+role+username).catch( err => console.log(err))
        const userToSave = salt.toJSON(hashedUser)
        const domainExists = await commands.sismember('tenants',domain)
        const userExists = domainExists ? await commands.hget('passwd',userToSave) : domainExists
        console.log('user exists ?', userExists, domainExists, domain+role+username)
        if (domainExists && userExists ) {
            var tokenString = auth.issueToken(username, role);
            const hashedPassword = await salt.hashRandomString(domain+role+username+password).catch( err => console.log(err))
            const passToSave = salt.toJSON( hashedPassword)
            const userHashes = await commands.hmset('passwd', userToSave, passToSave)
            console.log('add user operation:', userHashes)
            var response = `{ "status": "user created","token": "Bearer ${tokenString}", "username": "${username}", "role": "${role}", "domain":${domain} }`
            return res.status(200).end(response);
        } else 
        if (!domainExists) {
            var response = '{ "status": "domain or user does not exist or null" }'
            return res.status(200).end(response);
        } else {
            var response = '{ "status": "user does not exists. check or create it first" }'
            return res.status(200).end(response);
        }
    }
    userAbstraction(args, res, callback)
}

async function getAttribute(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    const credentials = req.body
    const attribute = req.swagger.params.attribute.value
    console.log('params', credentials, attribute)
    if (attribute && userAttributes.includes(attribute) && credentials.username && credentials.role && credentials.domain) {
        const username = credentials.username
        const domain = credentials.domain
        const userMD5 = salt.md5(domain+username)
        console.log(userMD5)
        if (attribute == 'profile') {
            const send = await commands.hgetall([userMD5,'profile'].join(':'))
            res.json(send);
        } else 
        if (attribute == 'rooms') {
            const send = await commands.smembers([userMD5,'rooms'].join(':'))
            res.json(send);
        } else {
            res.json({ "message": 'Unknown attribute' })
        }
    } else {
        res.json({ "message": 'No enough params' })
    }
    
}

function userAbstraction(args, res, callback) {
    const credentials = args.body
    console.log('add user credentials', credentials, !credentials.user)
    if (sMap.some( x => !credentials[x[0]])) {
        console.log('wrong parameters', args.body)
        var response = "{ message: 'Error: Missing params' }";
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(response);
    } else {
        if (!roles.includes(credentials.role)) {
          var response = `{ message: 'Error: No role' }`;
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(response);
        } else

        if ( sMap.find( x => typeof credentials[x[0]] == x[1] ) ) {  // check types
            callback(args, res);
        } else {
          var response = '{ message: "Error: Credentials incorrect" }';
          return res.status(403).end(response);
        }
    }
}