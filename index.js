const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');


const authRoutes = require('./routes/AuthRoutes');
require('dotenv').config();


// 🌐 CORS config (כולל credentials)
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
  
app.use(express.json());


const isProduction = process.env.NODE_ENV === 'production';

// 📦 Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Database Connected"))
  .catch((error) => console.log(error));

// 🚏 Routes
app.use('/auth', authRoutes);


// 🚀 Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});