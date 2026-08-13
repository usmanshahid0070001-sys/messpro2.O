import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db.js';

// 🛡️ SECURITY IMPORTS
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// ROUTE IMPORTS
import hostelRoutes from './modules/hostel/hostel.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import planRoutes from './modules/plan/plan.routes.js';
import userRoutes from './modules/user/user.routes.js';
import residenceRoutes from './modules/residence/residence.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import mealRoutes from './modules/meal/meal.routes.js'; 
import attendanceRoutes from './modules/mealRecord/mealRecord.routes.js';
import billRoutes from './modules/billing/bill.routes.js';
import complaintRoutes from './modules/complaint/complaint.routes.js';

dotenv.config(); // this will load the environment variables first 

const app = express();

// ==========================================
// 🛡️ GLOBAL SECURITY MIDDLEWARE
// ==========================================

// 1. Trust Reverse Proxy (Required for rate limiting behind Nginx/Cloudflare)
app.set('trust proxy', 1);

// 2. Set Security HTTP Headers
app.use(helmet());

// 3. Cross-Origin Resource Sharing (CORS)
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

// 4. Global Rate Limiter (Averages exactly 2 requests per second)
const globalLimiter = rateLimit({
  max: 120, // 120 requests per minute = 2 requests per second
  windowMs: 60 * 1000, // 1 minute window (Allows React to send burst requests on initial page load)
  message: 'Too many requests from this IP, please try again in a minute.'
});
app.use('/api', globalLimiter);

// 5. Body Parser & Payload Limits (Prevents RAM Overloading)
app.use(express.json({ limit: '10kb' })); 
app.use(cookieParser());

// 6. Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// 7. Data Sanitization against Cross-Site Scripting (XSS)
app.use(xss());

// 8. Prevent HTTP Parameter Pollution
// Whitelist allows duplicate query params for specific fields if needed
app.use(hpp({
  whitelist: ['mealType', 'status'] 
}));


// ==========================================
// 🚀 MOUNT ROUTES
// ==========================================

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/users', userRoutes);
app.use('/api/residence', residenceRoutes);
app.use('/api/meal-schedule', mealRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/billing', billRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/', (req, res) => {
  res.send('MessPro SaaS API is running securely...');
});

// Global Error Handler MUST be the last middleware
app.use(globalErrorHandler);

// ==========================================
// 🔌 SERVER & SOCKET.IO SETUP
// ==========================================

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
    console.log(`🚀 Super Admin Server running securely in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
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