import nodemailer from 'nodemailer';

const sendBrevo = async (options, fromEmail) => {
  console.log('Sending email via Brevo HTTP API...');
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'TattleTent', email: fromEmail },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Brevo API error');
  }
  console.log('Message sent via Brevo:', data.messageId || 'Success');
};

const sendSendGrid = async (options, fromEmail) => {
  console.log('Sending email via SendGrid HTTP API...');
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.email }] }],
      from: { email: fromEmail, name: 'TattleTent' },
      subject: options.subject,
      content: [{ type: 'text/html', value: options.html }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'SendGrid API error');
  }
  console.log('Message sent via SendGrid successfully');
};

const sendResend = async (options, fromEmail) => {
  console.log('Sending email via Resend HTTP API...');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'TattleTent <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Resend API error');
  }
  console.log('Message sent via Resend: %s', data.id);
};

const sendSMTP = async (options, fromEmail) => {
  console.log('Sending email via Nodemailer SMTP...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `TattleTent <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
};

const sendEmail = async (options) => {
  const fromEmail = process.env.EMAIL_USER || 'sanyamsj30@gmail.com';
  const emailService = String(process.env.EMAIL_SERVICE || '').trim().toLowerCase();

  // 1. Force service if explicitly chosen via EMAIL_SERVICE env var
  if (emailService === 'gmail' || emailService === 'smtp') {
    try {
      await sendSMTP(options, fromEmail);
      return;
    } catch (err) {
      console.error('Explicit SMTP failed, falling back...', err);
    }
  } else if (emailService === 'resend' && process.env.RESEND_API_KEY) {
    try {
      await sendResend(options, fromEmail);
      return;
    } catch (err) {
      console.error('Explicit Resend failed, falling back...', err);
    }
  } else if (emailService === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    try {
      await sendSendGrid(options, fromEmail);
      return;
    } catch (err) {
      console.error('Explicit SendGrid failed, falling back...', err);
    }
  } else if (emailService === 'brevo' && process.env.BREVO_API_KEY) {
    try {
      await sendBrevo(options, fromEmail);
      return;
    } catch (err) {
      console.error('Explicit Brevo failed, falling back...', err);
    }
  }

  // 2. Auto-detect based on available API Keys (Prioritizing Resend, then SendGrid, then Brevo, then SMTP)
  if (process.env.RESEND_API_KEY) {
    try {
      await sendResend(options, fromEmail);
      return;
    } catch (err) {
      console.warn('Auto-detected Resend failed, trying next...', err.message);
    }
  }
  if (process.env.SENDGRID_API_KEY) {
    try {
      await sendSendGrid(options, fromEmail);
      return;
    } catch (err) {
      console.warn('Auto-detected SendGrid failed, trying next...', err.message);
    }
  }
  if (process.env.BREVO_API_KEY) {
    try {
      await sendBrevo(options, fromEmail);
      return;
    } catch (err) {
      console.warn('Auto-detected Brevo failed, trying next...', err.message);
    }
  }

  // 3. Absolute Fallback: Nodemailer SMTP
  await sendSMTP(options, fromEmail);
};

export default sendEmail;
