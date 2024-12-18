import express from 'express';
import cors from 'cors';

import config from './config.js';
import loanAdminRoute from './routes/admin/loan.js';
import appointmentRoute from './routes/appointment.js';
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/admin/admin.js';
import authRoute from './routes/auth.js';
import bodyParser from 'body-parser';

import path from 'path';
import { fileURLToPath } from 'url';

import cron from 'node-cron';
// const { cypherQuerySession } = config;
// import { mergeUserQuery } from './cypher/child.js';
// import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const app = express();
// for parsing application/json
app.use(
  bodyParser.json({
    limit: '50mb'
  })
);
// for parsing application/xwww-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000000
  })
);

app.use(cors());
app.use(express.json());

app.use('/api/appointment', appointmentRoute);
app.use('/api/admin/loan', loanAdminRoute);

app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/auth', authRoute);

app.use(express.static('public'));
app.use(express.static('files'));

app.use('/static', express.static('public'));

app.listen(config.port, async () => {
  console.log(`Hello Server is live`);
});
