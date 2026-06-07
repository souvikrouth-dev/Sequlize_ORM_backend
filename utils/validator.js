//use this library for validate 
const validator = require('validator');

async function validateUser(data){

    try{ 

       const {first_name,last_name,email,gender,password}= data;
       //console.log(data);
       //first_name validation
       if(!first_name ) return("First name is requried");
       if(typeof first_name != "string") return( "Please provied a valid frist_name");
       if(first_name.length<3 || first_name.length>20)return("First name must be between 3 and 20 characters");

       //last_name validation
       if(!last_name ) return ("Last name is requried");
       if(typeof last_name != "string") return ("Please provied a valid last_name");
       if(last_name.length<3 || last_name.length>20) return ("Last name must be between 3 and 20 characters");
      

    //validation using validator library
    if(!validator.isEmail(data.email)) return ("Please provide a valid email");

       //gender validation
       if(gender != "male" && gender != "female" && gender != "other")
          return ("Gender must be male or female or other");

        if(!validator.isStrongPassword(data.password)) return("Week Password");

        return data;

    }catch(err){
        res.status(500).send("Error:"+ err.message);
    }


};

module.exports = validateUser;
