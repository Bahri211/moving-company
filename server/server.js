require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/quote', async (req, res) => {
  const { from, to, size, date, name, email, phone, smsConsent, notes } = req.body;

  if (!from || !to || !name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const text = `
New Quote Request — Cross-Country Movers

From:       ${from}
To:         ${to}
Home Size:  ${size || 'Not specified'}
Move Date:  ${date || 'Not specified'}

Name:       ${name}
Email:      ${email}
Phone:      ${phone}
SMS Opt-In: ${smsConsent ? 'Yes' : 'No'}
Notes:      ${notes || 'None'}

Submitted:  ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
  `.trim();

  try {
    await transporter.sendMail({
      from: `"Cross-Country Movers Website" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL || 'contact@50statemovers.com',
      replyTo: email,
      subject: `New Quote Request — ${name} (${from} → ${to})`,
      text,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ error: 'Failed to send. Please call us directly.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
