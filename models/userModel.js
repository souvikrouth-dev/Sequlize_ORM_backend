// userMOdel.js file is used t define the user model using Sequelize ORM.

const sequelize = require("../config/database");
const { Sequelize, DataTypes } = require('sequelize');

const People = sequelize.define(
  'People',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:true,
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    last_name:{
      type: DataTypes.STRING,
      allowNull:true,
    },

    email:{
      type: DataTypes.STRING,
      allowNull:false,
      unique:true,
       validate:{
        isEmail:true
       }
    },
    
    gender:{
      type:DataTypes.ENUM("male","female","others"),
      allowNull:false,
    },

    password:{
      type:DataTypes.STRING,
      allowNull:false,
    },
  },
  {
    timestamps:true
  });


  module.exports = { People };
 

