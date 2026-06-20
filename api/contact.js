const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const text = `
New Contact Message — 50STATEMOVERS INC

Name:    ${name}
Email:   ${email}
Phone:   ${phone || 'Not provided'}

Message:
${message}

Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
  `.trim();

  try {
    const { error } = await resend.emails.send({
      from: '50STATEMOVERS INC <contact@50statemovers.com>',
      to: 'contact@50statemovers.com',
      reply_to: email,
      subject: `New Contact Message — ${name}`,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send. Please call us directly.' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send. Please call us directly.' });
  }
};
