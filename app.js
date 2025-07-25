const express = require('express');
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/AuthRoutes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// 🌐 CORS config
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax' // כדי לא לחסום cross-origin
  }
}));

app.use(express.json());

// 📦 Routes
app.use('/auth', authRoutes);

module.exports = app;
