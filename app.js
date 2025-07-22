const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/AuthRoutes');

const app = express();

// 🌐 CORS config
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// 📦 Routes
app.use('/auth', authRoutes);

module.exports = app;
