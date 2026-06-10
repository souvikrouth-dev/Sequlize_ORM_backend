const express = require("express");
const validateUser  = require("../utils/new_validator")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sequelize = require("../config/database");
const radisClient = require("../config/redis");
const authRouter = express.Router();
const userAuth = require("../middleware/userAuth");
const { People } = require("../models/userModel");


// Registration Route
authRouter.post("/register", async (req,res)=>{
    try{
          
        await validateUser(req.body);

       //password store in hash from 
        req.body.password = await bcrypt.hash(req.body.password,10);
        

        await People.create({
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            email:req.body.email,
            gender:req.body.gender,
            password:req.body.password
        });

        res.status(201).send("User created successfully");

    }
    catch(err){
        res.status(500).send("Error:"+ err.message);
    }
})

// Login Route
authRouter.post("/login",async (req,res)=>{
    try{
        
        const{ email, password }= req.body;
        
        // 1. Check if email and password are provided
        if(!email || !password)
            res.status(400).send("Email and password are required");
        
         // 2. Find user by email using sequlize orm
         const user = await People.findOne({
            where:{email}
         });

        // 3. If user not found
        if(!user) res.status(404).send("user not found");
        
        // 4. Compare password with hashed password
        const isAllowed =await bcrypt.compare(password,user.password);
        if(!isAllowed) res.status(500).send("Invalid Cadential");

        // 5. Generate JWT token / Access token 
        //const token = jwt.sign({ email:user.email,password:user.password }, process.env.JWT_PASSKEY,{ expiresIn: "15m" });
       const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_PASSKEY, { expiresIn: "10m" })

        // 6.Generate Refresh Token
        const refreshToken = jwt.sign(
            { id:user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );
       
        //7.store jwt token in cookie
        //res.cookie("token",token);
        res.cookie("refreshToken",refreshToken,{httpOnly: true,});


        // res.status(200).send("Login successfully");
        res.status(200).json({
            message: "Login successful",
            accessToken
        });
        
    }
    catch(err){
        res.status(500).send("Error:"+ err.message);
    }
})

// Token Refresh Route 
authRouter.post("/refresh", (req, res) => {
  try {
   
     //1st verify the refresh token and genarated new acccess token 

    // 1. Cookie refresh token 
    const refreshToken = req.cookies.refreshToken;

    // 2. Not Present in Cookie 
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token not found" });

    // 3. Verify
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 4. Genareate new access token 
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_PASSKEY,
      { expiresIn: "10m" }
    );

    // 5. send new access token 
    res.status(200).json({ accessToken: newAccessToken });

  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// Logout Route 
authRouter.post("/logout", userAuth, async (req,res)=>{
    try{

        // const {token} = req.cookies;
        // Access token from Authorization header
        const authHeader = req.headers["authorization"];
        const accessToken = authHeader.split(" ")[1];

        // const payload = jwt.decode(token);
        const payload = jwt.decode(accessToken);



        //store the token in redis database 
        await radisClient.set(`token:${accessToken}`,"Blocked");
        //use for expire token manually time 
        //await radisClient.expire(`token:${token}`,30);

        //set token expire time 
        await radisClient.expireAt(`token:${accessToken}`,payload.exp);

          //res.cookie("token",null,{expires: new Date(Date.now())});
          // Refresh token cookie clear 
        res.clearCookie("refreshToken");
        res.status(200).send("Logout successfully");

    }catch(err)
    {
        res.status(500).send("Error:"+err.message);
    }
})

module.exports = authRouter;
