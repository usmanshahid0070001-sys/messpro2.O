

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { connectDB } from './config/db.js'

import hostelRoutes from './modules/hostel/hostel.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import planRoutes from './modules/plan/plan.routes.js';
import userRoutes from './modules/user/user.routes.js';
import residenceRoutes from './modules/residence/residence.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';

import mealRoutes from './modules/meal/meal.routes.js'; 
import attendanceRoutes from './modules/mealRecord/mealRecord.routes.js';

// 👇 NEW: Import the Billing Routes
import billRoutes from './modules/billing/bill.routes.js';

dotenv.config(); // this will load the environment variables first 

const app = express();

// global middlewares
app.use(helmet())

const allowedOriginPattern = /^(https?:\/\/localhost:\d+|https?:\/\/127\.0\.0\.1:\d+|https?:\/\/192\.168\.\d+\.\d+:\d+)$/;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin === process.env.FRONTEND_URL || allowedOriginPattern.test(origin)) {
            callback(null, true);
            return;
        }
        callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());
// Deserialization: Converts incoming JSON text from HTTP requests into usable JS Objects

connectDB()

app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/users', userRoutes);
app.use('/api/residence', residenceRoutes);
app.use('/api/meal-schedule', mealRoutes);
app.use('/api/attendance', attendanceRoutes);

// 👇 NEW: Mount the Billing Routes to the API
app.use('/api/billing', billRoutes);

app.get('/', (req, res) => {
  res.send('MessPro SaaS API is running securely...');
});

app.use(globalErrorHandler);

// Keep the development default aligned with the Vite proxy and API client.
const PORT = Number(process.env.PORT || 5000);

const server = http.createServer(app);

// Setup Socket.IO
export const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
        if (!origin || origin === process.env.FRONTEND_URL || allowedOriginPattern.test(origin)) {
            callback(null, true);
            return;
        }
        callback(null, false);
    },
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  // Clients will join a room based on their hostelId to receive targeted notifications
  socket.on('join_hostel_room', (hostelId) => {
    socket.join(hostelId);
    console.log(`Client ${socket.id} joined room: ${hostelId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`🚀 Super Admin Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please stop the existing process or choose another port.`);
      process.exit(1);
    }

    console.error('❌ Server error:', error);
    process.exit(1);
  });
};

startServer();
