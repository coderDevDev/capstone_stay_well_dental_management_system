import dotenv from 'dotenv';
import assert from 'assert';

import neo4j from 'neo4j-driver';
import mysql from 'mysql2/promise';

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

//import mysql from 'promise-mysql';
dotenv.config();

const {
  PORT,
  HOST,
  HOST_URL,
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  JWT_TOKEN_SECRET,
  NEO4J_URI,
  NEO4J_USER,
  NEO4J_PASSWORD,
  SENDGRID_API_KEY,
  DATABASE_URL
} = process.env;
let mySqlDriver;
let driver;
var connection;
var getDbConnection;
let firebaseConfig;
let firebaseStorage;

try {
  getDbConnection = async () => {
    // const pool = await mysql.createPool({
    //   host: 'localhost', // Database host
    //   user: 'root', // Database user
    //   password: '', // Database password
    //   database: 'final_bu', // Database name
    //   connectTimeout: 10000 // 10 seconds
    //   // waitForConnections: true,
    //   // connectionLimit: 10, // Max number of connections in the pool
    //   // queueLimit: 0 // No limit on queue
    // });

    // const pool = await mysql.createPool({
    //   host: '127.0.0.1',
    //   user: 'root',
    //   password: 'password',
    //   database: 'dental_clinic',
    //   port: 3306,
    //   waitForConnections: true,
    //   connectionLimit: 0, // Max number of connections in the pool
    //   queueLimit: 0,
    //   ssl: false,
    //   timezone: '+08:00' // Use Manila time (UTC+8)
    // });

    // const pool = await mysql.createPool({
    //   host: 'db.btmcdhltlvydssuebwir.supabase.co',
    //   user: 'bc30f9dc38379a',
    //   password: 'Vn8bma2WgWmWLhcE',
    //   database: 'postgres',
    //   port: 5432,
    //   waitForConnections: true,
    //   connectionLimit: 0, // Max number of connections in the pool
    //   queueLimit: 0 // No limit on queue
    // });

    const pool = await mysql.createPool({
      host: 'jcqlf1.stackhero-network.com',
      user: 'root',
      password: 'OwhHbxDtBwsDB9VlClLwfkzw9MTBr70m',
      database: 'dental_clinic',
      port: 4300,
      waitForConnections: true,
      connectionLimit: 0, // Max number of connections in the pool
      queueLimit: 0,
      ssl: false // Disable SSL connection
    });

    return pool;
  };

  mySqlDriver = await getDbConnection();

  // Your Firebase configuration
  firebaseConfig = {
    apiKey: 'AIzaSyAln9KogkLpr_eMbBLlnQfMae7Ji380phQ',
    authDomain: 'avdeasis-4b5c7.firebaseapp.com',
    projectId: 'avdeasis-4b5c7',
    storageBucket: 'avdeasis-4b5c7.appspot.com',
    messagingSenderId: '563212793374',
    appId: '1:563212793374:web:4a5f5dd187e0304661a00f',
    measurementId: 'G-5LTWLEWR22'
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  firebaseStorage = getStorage(app);

  // console.log({ firebaseStorage });
  console.log('DBs Connected');
} catch (err) {
  console.log(`Connection error\n${err}\nCause: ${err.cause}`);
}

let cypherQuerySession = `1`;

// let session = driver.session({ database: 'neo4j' });

// let cypherQuerySessionDriver = session;

// assert(PORT, 'Port is required');
// assert(HOST, 'Host is required');
// config
//config

let gmailEmailpassword = 'dqeq ukrn hvjg vnyx';
export default {
  port: PORT,
  host: HOST,
  hostUrl: HOST_URL,
  firebaseConfig,
  cypherQuerySession,
  JWT_TOKEN_SECRET,
  SENDGRID_API_KEY,
  cypherQuerySessionDriver: '',
  defaultDBName: 'neo4j',
  mySqlDriver: mySqlDriver,
  firebaseStorage,
  REACT_FRONT_END_URL: 'http://localhost:5173'
};
