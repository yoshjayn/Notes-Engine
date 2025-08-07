const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] // Add your frontend domain here
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Notes Engine API is running!',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const labelsRoutes = require('./routes/labels');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/labels', labelsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server function
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 5000;
  
  // For Vercel, we don't need to listen on a port
  if (process.env.NODE_ENV === 'development') {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

// Initialize server
startServer().catch(console.error);

// Export for Vercel
module.exports = app;