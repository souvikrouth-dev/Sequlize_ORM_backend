const express = require("express");
const validateUser  = require("../utils/new_validator")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sequelize = require("../config/database");
const radisClient = require("../config/redis");
const authRouter = express.Router();
const userAuth = require("../middleware/userAuth");
const { People } = require("../models/userModel");


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

        // 5. Generate JWT token
        const token = jwt.sign({ email:user.email,password:user.password }, process.env.JWT_PASSKEY,{ expiresIn: "1 days" });
       
        //6.store jwt token in cookie
        res.cookie("token",token);


        res.status(200).send("Login successfully");
        
    }
    catch(err){
        res.status(500).send("Error:"+ err.message);
    }
})

authRouter.post("/logout", userAuth, async (req,res)=>{
    try{

        const {token} = req.cookies;
        const payload = jwt.decode(token);

        //store the token in redis database 
        await radisClient.set(`token:${token}`,"Blocked");
        //use for expire token manually time 
        //await radisClient.expire(`token:${token}`,30);

        //set token expire time 
        await radisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires: new Date(Date.now())});
        res.status(200).send("Logout successfully");

    }catch(err)
    {
        res.status(500).send("Error:"+err.message);
    }
})

module.exports = authRouter;
