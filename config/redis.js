//this file is used to connect to the Redis database using the redis client.
const redis =  require('redis');


const radisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_DB_PASSWORD,
    socket: {
        host: 'redis-10049.crce283.ap-south-1-2.ec2.cloud.redislabs.com',
        port: process.env.REDIS_DB_PORT
    }
});

module.exports = radisClient;
