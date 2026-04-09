const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  openaiKey: process.env.OPENAI_API_KEY,
  uploadsDir: path.join(__dirname, '..', 'uploads'),
  emailHost: process.env.EMAIL_SMTP_HOST,
  emailPort: process.env.EMAIL_SMTP_PORT ? Number(process.env.EMAIL_SMTP_PORT) : 587,
  emailSecure: process.env.EMAIL_SMTP_SECURE === 'true',
  emailUser: process.env.EMAIL_SMTP_USER,
  emailPass: process.env.EMAIL_SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER,
  otpExpiresMinutes: process.env.OTP_EXPIRES_MINUTES ? Number(process.env.OTP_EXPIRES_MINUTES) : 10,
};
