const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
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
app.get("/createbackend", (req, res) => {
  try{
    res.status(200).json({ message: "Backend route is working" });
  }
  catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// 🚀 Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});