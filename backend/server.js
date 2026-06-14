require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/customers',     require('./routes/customers'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/delivery',      require('./routes/delivery'));
app.use('/api/dashboard',     require('./routes/dashboard'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🌿 Gawali Fresh API is running!', status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
