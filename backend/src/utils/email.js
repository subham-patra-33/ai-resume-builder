const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;
if (config.emailHost && config.emailUser && config.emailPass) {
  transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailSecure,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });
}

async function sendMail(options) {
  if (!transporter) {
    console.log('OTP email fallback: no SMTP configured. Email payload:', options);
    return;
  }
  return transporter.sendMail(options);
}

async function sendOtpEmail(to, code) {
  const subject = 'Your resume builder verification code';
  const text = `Your verification code is ${code}. It expires in ${config.otpExpiresMinutes} minutes.`;
  const html = `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in ${config.otpExpiresMinutes} minutes.</p>`;
  const from = config.emailFrom || config.emailUser || 'no-reply@example.com';

  return sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendOtpEmail,
};
