import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // If Resend API Key is configured, use the HTTP API (bypasses Render SMTP port blocking)
  if (process.env.RESEND_API_KEY) {
    try {
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
      return;
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      throw new Error('Email could not be sent.');
    }
  }

  // Fallback to Nodemailer SMTP (e.g. for local development)
  try {
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
      from: `TattleTent <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent.');
  }
};

export default sendEmail;
