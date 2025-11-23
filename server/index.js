const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Note: multer handles multipart/form-data, so we don't need express.json for file uploads

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tournament';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Debug: Log route registration
console.log('Routes registered:');
console.log('  - /api/users');
app.use('/api/payments', require('./routes/payments'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payment-options', require('./routes/paymentOptions'));
app.use('/api/games', require('./routes/games'));
app.use('/api/tournament-types', require('./routes/tournamentTypes'));
console.log('  - /api/tournament-types');
app.use('/api/home-images', require('./routes/homeImages'));
console.log('  - /api/home-images');
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/tournament-registrations', require('./routes/tournamentRegistrations'));
app.use('/api/match-schedules', require('./routes/matchSchedules'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payment-options', require('./routes/paymentOptions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payment-options', require('./routes/paymentOptions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tournament API is running' });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Serve React app for all non-API routes (must be after API routes)
  app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

