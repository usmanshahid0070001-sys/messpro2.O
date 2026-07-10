import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import {connectDB} from './config/db.js'



import hostelRoutes from './modules/hostel/hostel.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';

dotenv.config();//this will load the environment variables first 


const app=express();


//global middlewares
app.use(helmet())

const allowedOriginPattern = /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/;

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



app.get('/', (req, res) => {
  res.send('MessPro SaaS API is running securely...');
});


app.use(globalErrorHandler);


const PORT = Number(process.env.PORT || 5001);

const startServer = () => {
  const server = app.listen(PORT, () => {
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

