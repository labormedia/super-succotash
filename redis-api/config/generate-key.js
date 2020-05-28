const util = require('util')

const salt = require('../api/controllers/hash-salt-library')
const auth = require('../api/helpers/auth')

var redisNewUser = require('./redis-client')();
var redis = redisNewUser.client
var commands = redisNewUser.commands.reduce( (o,x) => { o[x] = util.promisify(redis[x]).bind(redis); return o }, {} )

const schema = {
    username: 'string',
    password: 'string',
    role: 'string',
    domain: 'string'
}

const superadmin = {
    username: "superuser",
    password: "cat", //"verylongsuperadminpassword"
    domain: "redis",
    role: "admin"
}
const generate = async () => {
    console.log(Object.entries(schema).map( x => typeof superadmin[x[0]] == x[1] ) )
    if ( Object.entries(schema).find( x => typeof superadmin[x[0]] == x[1] ) ) {  // check types
        const username = superadmin['username']
        const password = superadmin['password']
        const domain = superadmin['domain']
        const role = superadmin['role']
        const userMD5 = salt.md5(domain+username)
        const hashedUser = await salt.hashString(domain+role+username).catch( err => console.log(err))
        const userToSave = salt.toJSON(hashedUser)
        const domainExists = await commands.sismember('tenants',domain)
        const userExists = domainExists ? await commands.hget('passwd',userToSave) : await commands.sismember('tenants',domain)
        console.log('user exists ?', userExists)
        if (!domainExists && !userExists ) {
            var tokenString = auth.issueToken(username, role);
            const hashedPassword = await salt.hashRandomString(domain+role+username+password).catch( err => console.log(err))
            const passToSave = salt.toJSON( hashedPassword)
            await commands.sadd('tenants',domain)
            const userHashes = await commands.hset('passwd', userToSave, passToSave)
            const userProfile = await commands.hmset([userMD5,'profile'].join(':'), 'username', username, 'domain', domain, 'role',role, 'md5', userMD5,'hash:rooms', [userMD5,'rooms'].join(':'))
            console.log('add user operation:', userHashes)
            console.log('new user',userToSave, passToSave)
            var response = `{ "status": "user created","token": "Bearer ${tokenString}", "username": "${username}", "role": "${role}", "domain":${domain} }`
            console.log(response);
        } else 
        if (domainExists) {
            var response = '{ "status": "domain already exists. lets initalize from scratch" }'
            console.log(response);
        } else {
            var response = '{ "status": "user already exists" }'
            console.log(response);
        }
    } else {
        console.log('missing params')
    }
    
    process.exit(0)
}

exports.generate = generate

generate()

