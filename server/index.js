import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import config from './config.js';
import loanAdminRoute from './routes/admin/loan.js';
import appointmentRoute from './routes/appointment.js';
import servicesRoute from './routes/services.js';
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/admin/admin.js';
import authRoute from './routes/auth.js';
import bodyParser from 'body-parser';
import inventoryRoutes from './routes/inventory.js';
import orderRoutes from './routes/orders.js';
import supplierRoutes from './routes/suppliers.js';
import employeeRoutes from './routes/employee.js';
import attendanceRoutes from './routes/attendance.js';
import roleRoutes from './routes/roles.js';

import dentalServiceRoutes from './routes/dental-services.js';
import dentalBranchesRoutes from './routes/dental-branches.js';

import path from 'path';
import { fileURLToPath } from 'url';

import cron from 'node-cron';
import payrollRoutes from './routes/payroll.js';
import treatmentRoutes from './routes/treatments.js';
import paymentRoutes from './routes/payments.js';

// const { cypherQuerySession } = config;
// import { mergeUserQuery } from './cypher/child.js';
// import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: 'https://staywelldental.onrender.com', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

const io = new Server(httpServer, {
  cors: {
    origin: 'https://staywelldental.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io available globally
global.io = io;

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', error => {
    console.error('Socket error:', error);
  });
});

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

app.use(express.json());

app.use('/api/appointment', appointmentRoute);
// app.use('/api/services', servicesRoute);
app.use('/api/admin/loan', loanAdminRoute);
app.use('/api/users', userRoute);
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/auth', authRoute);

app.use('/api', inventoryRoutes);
app.use('/api', orderRoutes);
app.use('/api', supplierRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', roleRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', dentalServiceRoutes);
app.use('/api', dentalBranchesRoutes);
app.use(express.static('public'));
app.use(express.static('files'));

app.use('/static', express.static('public'));

// Schedule daily inventory check at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const [inventory] = await db.query(queries.getAllInventory);

    inventory.forEach(item => {
      if (item.quantity <= item.min_quantity) {
        // Emit low stock event
        global.io.emit('lowStockAlert', {
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          minQuantity: item.min_quantity
        });
      }
    });
  } catch (error) {
    console.error('Error checking inventory levels:', error);
  }
});

httpServer.listen(config.port, async () => {
  console.log(`Server is live`);
});
