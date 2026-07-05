import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import {connectDB} from './config/db.js'



import hostelRoutes from './modules/hostel/hostel.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';

dotenv.config();//this will load the environment variables first 


const app=express();


//global middlewares
app.use(helmet())


app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))


app.use(express.json());
// Deserialization: Converts incoming JSON text from HTTP requests into usable JS Objects



connectDB()

app.use('/api/hostels', hostelRoutes);



app.get('/', (req, res) => {
  res.send('MessPro SaaS API is running securely...');
});


app.use(globalErrorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Super Admin Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

