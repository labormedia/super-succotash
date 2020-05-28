'use strict';
var util = require('util');
const through = require('./through-library')
const connection = require('../../config/redis-client')
const redisNewUser = connection();
const redis = redisNewUser.client
const io = redisNewUser.io
const commands = redisNewUser.commands.reduce( (o,x) => { o[x] = util.promisify(io[x]).bind(io); return o }, {} )
const salt = require('./hash-salt-library')

module.exports = {
    joinRoom: joinRoom,
    getMessages: getMessages,
    pollNewMessages: pollNewMessages,
    sendMessage: sendMessage
  };

function getMembersKey(channelName) {
    return `room:${channelName.toLowerCase()}:members`;
}

function getMessagesKey(args,res) {
    return `room:${channelName}:log`;
}

async function getMessages (args,res) {
  const params = args.body
  if (!args.swagger.params.id && !args.swagger.params.number) {
    console.log('wrong parameters', args.body)
    var response = `{ "message": 'Error: No params' }`;
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(response);
  } else {
    const roomMD5 = args.swagger.params.id.value
    const number = parseInt(args.swagger.params.number.value)
    if (typeof roomMD5 == 'string' && typeof number == 'number' && number > 0 && number < 100) {
      const roomKey = getMembersKey(roomMD5)
      const messages = (await commands.xrange(roomMD5, '-', '+', 'COUNT', number)).map(result => parseChannelMessages(result, roomMD5));
      var response = messages ? `{ "room": "${roomMD5}", "messages": ${JSON.stringify(messages)} }` : `{ "message": "No connection." }`
      return res.status(403).end(response);
    } else {
      var response = '{ "message": "Error: Type not valid." }';
      return res.status(403).end(response);
    }
  }
}

async function getMembers (channelName) {
    return await commands.smembers(getMembersKey(channelName));
}

async function joinRoom (args,res) {
  const params = args.body
  if (!params.username && !params.domain && !params.title) {
    console.log('wrong parameters', args.body)
    var response = "{ message: 'Error: No params' }";
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(response);
  } else {
    const username = params.username
    const domain = params.domain
    const title = params.title
    const role = params.role
    console.log('params', username, domain, title)
    if (typeof username == 'string' && typeof domain == 'string' && typeof title == 'string' && typeof role == 'string') {
      const hashedUser = await salt.hashString(domain+role+username).catch( err => console.log(err))
      const userToSave = salt.toJSON(hashedUser)
      const userMD5 = salt.md5(domain+username)
      const domainExists = await commands.sismember('tenants',domain)
      const userExists = domainExists ? await commands.hget('passwd',userToSave) : domainExists
      console.log('user exists ?', userExists)
      if (userExists) {
        const roomMD5 = salt.md5(domain+username+title)
        const roomKey = getMembersKey(roomMD5)
        console.log('room key', roomKey)
        // const userProfile = await commands.sadd()
        await commands.sadd(roomKey, username);
        await commands.sadd(await commands.hget([userMD5,'profile'].join(':'), 'hash:rooms'), roomMD5);
        const messageId = await commands.xadd(roomMD5, '*', 'message', `${username} has joined the channel.`, 'user', username, 'title', title, 'domain',domain, 'room', roomMD5);
        console.log('message id',messageId)
        const messages = await commands.xrevrange(roomMD5,'+', '-', 'COUNT', 25);
        
        // console.log('messages',messages)
        var response = messageId ? `{ "room": "${roomMD5}", "messages": '${JSON.stringify(messages)}', "messageId": ${messageId} }` : `{ "message": "No connection." }`
        return res.status(200).end(response);
      } else {
        var response = `{ Error: 'user or domain does not exist' }`
        return res.status(403).end(response);
      }

    } else {
      var response = '{ message: "Error: Type not valid." }';
      return res.status(403).end(response);
    }
  }
}

async function sendMessage (args,res) {
  const params = args.body
  if (!args.swagger.params.id || !params.cookie.username || !params.cookie.domain || !params.cookie.role || !params.message) {
    console.log('wrong parameters', args.body)
    var response = '{ "message": "Error: No params" }';
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(response);
  } else {
    const roomMD5 = args.swagger.params.id.value
    const username = params.cookie.username
    const domain = params.cookie.domain
    const message = params.message
    const role = params.cookie.role
    const title = params.title ? params.title : null
    console.log('params', username, domain, message, role)
    if (typeof roomMD5 == 'string' && typeof username == 'string' && typeof domain == 'string' && typeof role == 'string' && typeof message == 'string') {
      const hashedUser = await salt.hashString(domain+role+username).catch( err => console.log(err))
      const userToSave = salt.toJSON(hashedUser)
      const userMD5 = salt.md5(domain+username)
      const domainExists = await commands.sismember('tenants',domain)
      const userExists = domainExists ? await commands.hget('passwd',userToSave) : domainExists
      console.log('user exists ?', userExists)
      if (userExists) {
        const roomKey = getMembersKey(roomMD5)
        console.log('room members key', roomKey)
        const isMember = await commands.sismember(roomKey, username);
        console.log('is member ?', isMember)
        // await commands.sadd(await commands.hget([userMD5,'profile'].join(':'), 'hash:rooms'), roomMD5);
        const previousMessage = await commands.xrevrange(roomMD5,'+', '-', 'COUNT', 1)
        console.log('previous message', previousMessage)
        const previousObject = ( y => y.reduce( (a,x,i) => {i%2 ? a[y[i-1]] = x : a; return a }, {} ) )(previousMessage[0][1])
        console.log('previous Object', previousObject)
        const messageId = isMember ? await commands.xadd(roomMD5, '*', 'message', message, 'user', username, 'title', title != '' ? title : previousObject.title, 'domain',domain, 'room', roomMD5) : previousObject.room;
        console.log('message id',messageId)
        const messages = await commands.xrange(roomMD5,'-', '+', 'COUNT', 25);
        
        console.log('messages',messages)
        var response = messageId ? `{ "room": "${roomMD5}", "messages": ${JSON.stringify(messages)}, "messageId": "${messageId}" }` : `{ "message": "No connection." }`
        return res.status(200).end(response);
      } else {
        var response = `{ "Error": "user or domain does not exist" }`
        return res.status(403).end(response);
      }

    } else {
      var response = '{ "message": "Error: Type not valid." }';
      return res.status(403).end(response);
    }
  }
}

async function part (channelName, userName) {
    await redis.srem(getMembersKey(channelName), userName);
    await redis.xadd(getMessagesKey(channelName), {message: `${userName} has left the channel.`, part: userName});
}

async function send(channelName, userName, message) {
    return await commands.xadd(getMessagesKey(channelName), {userName, message})
}

const pollCache = {}; // storage for a shared cache of polls

async function pollNewMessages (args,res) {
  const roomMD5 = args.swagger.params.id.value
  if (pollCache[roomMD5]) return pollCache[roomMD5]; // use the cache
  let seenId = null; // variable to hold our position in the stream
  let key = roomMD5 //getMessagesKey(channelName); // derive the key (i.e. channel:welcome:log)
  let xio = io.duplicate(); // create a new connection for polling this stream
  console.log('KEY', key)
  const delay = 10000
  let block = (delay) => xio.xread('BLOCK', delay , 'COUNT', 100, 'STREAMS', key,'$')
    .then( x => {
      const next = x ? 
        () => { 
          console.log('corking')
          res.cork()
          res.write(JSON.stringify(x))
          // args.res.uncork()
          // res.uncork()
          process.nextTick(doUncork, res);
          return x
        }
        : 
        () => {
          // res.write('{ data: "timeout with no data"}')
          console.log('no more data')
          // res.end()
          return x
        }
      // res.end()
      return next()
    })
    .then( x => {
      const next = !x ? res.end() : block(delay)
    })
  block(delay)

  function doUncork(stream) {
    stream.uncork();
  }
  
  console.log('block', block)
}

function parseChannelMessages (streamEvent, channelName) {
    return streamEvent[1].reduce((result, value, index, array) => {
        if (index % 2 === 0) {
            if (array.length > index) {
                result[array[index]] = array[index+1];
            }
        }
        return result;
    }, {channel: channelName, id: streamEvent[0]});
}