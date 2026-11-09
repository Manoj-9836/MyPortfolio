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

// Middleware - CORS Configuration for Vercel and local-network testing
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL || 'http://localhost:5173'
];

const isPrivateNetworkOrigin = (origin) => {
  if (!origin) return true;

  try {
    const url = new URL(origin);
    const isHttp = url.protocol === 'http:';
    const isPrivateIpv4 = /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(url.hostname);
    return allowedOrigins.includes(origin) || (isHttp && isPrivateIpv4);
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isPrivateNetworkOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
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
