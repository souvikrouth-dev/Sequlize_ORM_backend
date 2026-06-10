
// const jwt = require('jsonwebtoken');
// const radisClient = require('../config/redis');

// const userAuth = async (req,res,next) => {
    
//     try{
        
//            //for testing 
//            console.log("Middleware Started");
            
//              //Authentication code 
//             const { token } = req.cookies;
//             if(! token)
//             {
//                 throw new Error("Token Does not Exits");
//             }
//             jwt.verify(token,process.env.JWT_PASSKEY);

//             const isBlocked = await radisClient.exists(`token:${token}`);
//             if(isBlocked) throw new Error("Invalid token");

//             next();
            
//             //for testing 
//             console.log("middleware code working!");

//     }
//     catch(err)
//     {
//         res.status(500).send("Error:"+ err.message);
//     }

// }

// module.exports = userAuth;


const jwt = require('jsonwebtoken');
const radisClient = require('../config/redis');

const userAuth = async (req, res, next) => {
  try {
    //for testing 
    console.log("Middleware Started");

//Authentication code 

    // 1.To access token from Authorization header 
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ message: "Access token required" });

    // 2.get token from barear token 
    //split is used to split the string into an array 
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Token missing" });

    // 3. Verify the token and get the payload 
    const payload = jwt.verify(token, process.env.JWT_PASSKEY);
    //req.user = payload; // Strore payload in req.user for later use 

    // 4. Redis blacklist check 
    const isBlocked = await radisClient.exists(`token:${token}`);
    if (isBlocked) throw new Error("Invalid token");
 

     //for testing 
    console.log("Middleware working!");
    next();

  } catch (err) {
    return res.status(401).send("Error: " + err.message);
  }
};

module.exports = userAuth;