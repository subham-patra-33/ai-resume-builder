const mongoose = require('mongoose');
const config = require('./src/config/index');
const Otp = require('./src/models/Otp');

(async () => {
  try {
    const email = `e2e-user-${Date.now()}@example.com`;
    const password = 'Password123!';
    const name = 'E2E User';
    console.log('email', email);

    const sendRes = await fetch('http://localhost:4000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    console.log('sendOtp status', sendRes.status);
    console.log('sendOtp body', await sendRes.text());

    await mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const otpDoc = await Otp.findOne({ email }).sort({ createdAt: -1 }).lean();
    console.log('otp doc', otpDoc ? { code: otpDoc.code, used: otpDoc.used, expiresAt: otpDoc.expiresAt } : null);
    if (!otpDoc) process.exit(1);
    const code = otpDoc.code;

    const verifyRes = await fetch('http://localhost:4000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    console.log('verifyOtp status', verifyRes.status);
    console.log('verifyOtp body', await verifyRes.text());

    const registerRes = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, otp: code }),
    });
    console.log('register status', registerRes.status);
    const registerBody = await registerRes.json().catch(() => null);
    console.log('register body', registerBody);
    if (!registerBody || !registerBody.token) process.exit(1);

    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('login status', loginRes.status);
    const loginBody = await loginRes.json().catch(() => null);
    console.log('login body', loginBody);
    if (!loginBody || !loginBody.token) process.exit(1);

    const meRes = await fetch('http://localhost:4000/api/auth/me', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginBody.token}` },
    });
    console.log('me status', meRes.status);
    console.log('me body', await meRes.text());
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
