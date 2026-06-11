const express = require("express");
require('dotenv').config()
const sequelize = require("./config/database")
const { People } = require(".//models/userModel")
const validateUser  = require("./utils/new_validator")
const validator = require('validator');
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const userAuth = require("./middleware/userAuth")
const authRouter = require("./routes/auth")
const userRouter = require("./routes/users")
const radisClient = require("./config/redis");
const rateLimiter = require("./middleware/rateLimiter");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan')


const app = express();
app.use(express.json());
app.use(cookieParser());
// Adds headers: Access-Control-Allow-Origin: *
app.use(cors());
//Adds extra security headers to the responce 
//enables 15+ security headers
app.use(helmet());
// Logging
app.use(morgan('dev'));

app.use(rateLimiter);

//Express Router 
app.use("/",authRouter);
app.use("/",userRouter);

const initilizeConnection = async ()=>{

    try{

        await radisClient.connect();
        console.log("Redis Database is Connected in server.")

        await sequelize.authenticate();
        console.log("Postgre SQL Database is connected in server.")
        
        People.sync({ alter: true });
        console.log("Table created successfully");
        
        app.listen(process.env.PORT_NUMBER,()=>{
        console.log("Surver is running on port 4000");
    });

    }catch(err)
    {
        console.log("Error:"+err.message);
    }
}

initilizeConnection(); 