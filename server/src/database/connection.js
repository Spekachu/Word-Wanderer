import dotenv from 'dotenv';
dotenv.config({ debug: false });

import pg from 'pg';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
  host: process.env.DB_HOST, 
  dialect: 'postgres',
  logging: false,
  dialectModule: pg
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

connectDB();

export default sequelize;
