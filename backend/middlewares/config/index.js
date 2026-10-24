const dotenv = require('dotenv');
dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/opspulse',
  JWT_SECRET: process.env.JWT_SECRET || 'opspulse_jwt_secret_key_2024',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'opspulse_refresh_secret_key_2024',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
  },
  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || ''
  },
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@opspulse.com',
  FROM_NAME: process.env.FROM_NAME || 'OpsPulse',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  JWT_COOKIE_EXPIRE: 7,
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ENGINEER: 'engineer',
    EMPLOYEE: 'employee'
  },
  INCIDENT_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  },
  INCIDENT_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  ASSET_STATUS: {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    MAINTENANCE: 'maintenance',
    RETIRED: 'retired'
  },
  CHANGE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed'
  },
  SLA_PRIORITY: {
    CRITICAL: 4,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 48
  }
};

module.exports = config;
