const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_CONNECTING_PASSWORD,
    {
        host: 'localhost',
        dialect:  'postgres'
    }
);

module.exports = sequelize;



