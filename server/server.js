require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://moving-company-drab.vercel.app',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { error } = await resend.emails.send({
      from: 'Cross-Country Movers <onboarding@resend.dev>',
      to: process.env.TO_EMAIL || 'contact@50statemovers.com',
      reply_to: email,
      subject: `New Quote Request — ${name} (${from} → ${to})`,
      text,
    });
    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send. Please call us directly.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send. Please call us directly.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
