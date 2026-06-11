const { RedisClient } = require("redis");
const radisClient = require("../config/redis");

const rateLimiter = async(req,res,next) =>{

    try{
        const ip = req.ip;
        console.log(ip);

        // get the last request
        const lastRequest = await radisClient.get(`lastReq:${ip}`);
        console.log((lastRequest));

        if(lastRequest)
        {
            const differ = Date.now() - parseInt(lastRequest);
                  if(differ < 5000) {
                      throw new Error("Please wait 5 seconds between requests");
                  }
        }

        await radisClient.set(`lastReq:${ip}`, Date.now());


        const count =  await radisClient.incr(ip);
        console.log(count);

        if(count>60)
        {
            throw new Error("User Limit Exceeded");
            
        }

        if(count == 1){
            await radisClient.expire(ip,3600);
            await radisClient.expire(`lastReq:${ip}`, 3600);
        }
        
         next();
    }
    catch(err)
    {
        res.status(500).send("Error:"+ err.message);
    }
}

module.exports = rateLimiter;