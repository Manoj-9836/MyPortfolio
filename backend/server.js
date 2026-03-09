import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware - CORS Configuration for Vercel
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:5174',
    process.env.FRONTEND_URL || 'http://localhost:5173' // Vercel production URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolio.js';

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Portfolio API is running' });
});

// Ping endpoint for Render keep-alive (prevents sleeping)
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Portfolio Backend API',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      ping: '/ping',
      auth: '/api/auth',
      portfolio: '/api/portfolio'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
