require('dotenv').config();
const http = require('http');
const express = require('express');
const { connectDB, disconnectDB } = require('./src/config/db');
const app = require('./src/app');
const Otp = require('./src/models/Otp');

async function post(url, data) {
  const body = JSON.stringify(data);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

(async () => {
  const port = 5010;
  const server = http.createServer(app);

  try {
    await connectDB();
    await new Promise((resolve, reject) => {
      server.listen(port, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    console.log('In-process server started on port', port);

    const email = `e2e-user-${Date.now()}@example.com`;
    const password = 'Password123!';
    const name = 'E2E User';

    console.log('Testing email:', email);

    const sendOtp = await post(`http://127.0.0.1:${port}/api/auth/send-otp`, { email });
    console.log('sendOtp', sendOtp.status, sendOtp.body);

    const otpDoc = await Otp.findOne({ email }).sort({ createdAt: -1 }).lean();
    console.log('otpDoc', otpDoc ? { code: otpDoc.code, used: otpDoc.used, expiresAt: otpDoc.expiresAt } : null);
    if (!otpDoc) throw new Error('OTP document not found');

    const verifyOtp = await post(`http://127.0.0.1:${port}/api/auth/verify-otp`, { email, code: otpDoc.code });
    console.log('verifyOtp', verifyOtp.status, verifyOtp.body);

    const register = await post(`http://127.0.0.1:${port}/api/auth/register`, { name, email, password, otp: otpDoc.code });
    console.log('register', register.status, register.body);

    if (!register.body || !register.body.token) {
      throw new Error('Register failed');
    }

    const login = await post(`http://127.0.0.1:${port}/api/auth/login`, { email, password });
    console.log('login', login.status, login.body);

    if (!login.body || !login.body.token) {
      throw new Error('Login failed');
    }

    const meRes = await fetch(`http://127.0.0.1:${port}/api/auth/me`, {
      headers: { Authorization: `Bearer ${login.body.token}` },
    });
    const meBody = await meRes.json().catch(() => null);
    console.log('me', meRes.status, meBody);

    console.log('E2E auth flow completed successfully');
  } catch (err) {
    console.error('E2E auth flow failed:', err);
    process.exitCode = 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
  }
})();
