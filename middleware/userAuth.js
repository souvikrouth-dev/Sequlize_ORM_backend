
const jwt = require('jsonwebtoken');
const radisClient = require('../config/redis');

const userAuth = async (req,res,next) => {
    
    try{
        
           //for testing 
           console.log("Middleware Started");
            
             //Authentication code 
            const { token } = req.cookies;
            if(! token)
            {
                throw new Error("Token Does not Exits");
            }
            jwt.verify(token,process.env.JWT_PASSKEY);

            const isBlocked = await radisClient.exists(`token:${token}`);
            if(isBlocked) throw new Error("Invalid token");

            next();
            
            //for testing 
            console.log("middleware code working!");

    }
    catch(err)
    {
        res.status(500).send("Error:"+ err.message);
    }

}

module.exports = userAuth;