const express = require("express");
const validateUser  = require("../utils/new_validator")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const userAuth = require("../middleware/userAuth");
const { People } = require("../models/userModel");
const { x } = require("joi");


const userRouter = express.Router();

//get all api
userRouter.get("/users", userAuth,async (req,res) =>{
    try{

        const users = await People.findAll();
        res.status(200).send(users);   

    }catch(err){
        res.status(500).send("Error:"+ err.message);
    }
})

//get one 
userRouter.get("/userone",userAuth, async (req,res)=>{
    try
{
    const {id}=req.query;
    if(!id) return res.status(400).send("Id is requried");

    const user = await People.findOne({
        where:
        {
            id:id
        }
    });
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.status(200).send(user);
}
catch(err)
{
    res.status(500).send("Error:"+err.message);
}
})


// update api 
userRouter.put("/users", userAuth,async (req,res)=>{
    try{
        
         const {id}=req.query;
         //console.log(id);
         if(!id) return res.status(400).send("ID is required");

         const{first_name,last_name,email,gender,password} = req.body;
         let storePassword;
         if(password) {
             storePassword = await bcrypt.hash(password,10);
         }


         const updateUser = await People.update(
        {
            first_name,
            last_name,
            email,
            gender,
            password:storePassword
        },
        {
            where:{id},
            validate: true         //check model vlidation in update operation 
        }
        );

        //People.update return an arr 0(not success) or 1(success). 
        if(updateUser[0] === 0){
            return res.status(404).send("User not found");
           }
            res.status(200).send("User updated successfully");
    }catch(err){
        res.status(500).send("Error:"+ err.message);
    }
})

//update one 
userRouter.patch("/users", userAuth, async (req, res) => {
    try {

        const { id } = req.query;

        if (!id) {
            return res.status(400).send("ID is required");
        }

        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedUser = await People.update(
            updateData,
            {
                where: { id },
                validate: true
            }
        );

        if (updatedUser[0] === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).send("User updated successfully");

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

//delete api
userRouter.delete("/users",userAuth, async (req,res)=>{
    try{

        const {id}=req.query;
        // console.log(id);
         if(!id) return res.status(400).send("ID is required");

        const deleteUser = await People.destroy({
            where:{
                id:id
            }
        });

        if(! deleteUser){
            return res.status(404).send("User not found");
        }

        res.status(200).send("User deleted successfully");
    }
    catch(err){
        res.status(500).send("Error:"+ err.message);
    }
})



module.exports = userRouter;

