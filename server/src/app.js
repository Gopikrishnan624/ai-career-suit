import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware (must keep 4 args for Express to treat as error handler)
app.use((err, req, res, next) => {
  void next;
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
