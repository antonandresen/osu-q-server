const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./db');
const { connectOsuBot } = require('./osu/osubot');

// Load env
dotenv.config({ path: './config.env' });

// Init app.
const app = express();

// Connect database.
connectDB();

// Connect osu! Bot.
connectOsuBot();

// Middlewares.
app.use(cors()); // Cors headers.
app.use(express.json({ extended: false })); // Parse JSON.
app.use(helmet()); // Security headers.

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); // Logging middleware.
}

// Make sure everythings working endpoint.
app.get('/', (req, res) => {
  res.json({ hi: 'its working!' });
});

// Routes.
app.use('/api/v1/users', require('./routes/apiv1/users'));
app.use('/api/v1/osu', require('./routes/apiv1/osu'));

// Handle production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/public'));
}

module.exports = app;
