const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute')
const app = express();

// Middleware pour les cookies
app.use(cookieParser());

// Middleware pour autoriser les requêtes CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', userRoute);

app.listen(5000, () => {
  console.log("listening on port 5000");
});