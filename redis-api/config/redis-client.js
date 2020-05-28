'use strict;'
const redis = require('redis') //require('./modules-plugin').extend(require('redis'))var util = require('util');
const ioredis = require('ioredis')
const { promisify } = require('util')  // todo: promisify commands
var crypto = require('crypto');

const connection = (() => {
    switch (process.env.NODE_ENV) {
        case 'local':
            return {} 
        case 'development':
            return { 
                host:'172.16.238.10',
                port: 6379
            }
        case 'production':
            return { 
                host:'xxx.cache.amazonaws.com',
                port: 6379,
                tls: { checkServerIdentity: () => undefined }
            }
        case 'default':
            return {}
    } 
})()

// console.log('connect to', connection)



module.exports = () => {
    const cexport = ['duplicate','sadd', 'xadd', 'xread', 'xrange', 'xrevrange', 'smembers', 'sismember',  'srem', 'hget', 'hexists', 'hmset', 'hset', 'hdel', 'hgetall']
    console.log('connecting to ', connection)
    require('redis-streams')(redis);
    const redisClient = redis.createClient(connection);
    const io = new ioredis(connection)
    redisClient.on('connect', function() {
        console.log('Redis connected');
    });
    redisClient.on('error', function (err) {
        console.log('Something went wrong ' + err);
    });
    const commands = cexport
    // console.log('commands', commands)
    return { client : redisClient, commands: commands, io:io } //{ client: redisClient, commands: commands, check:0 }
}