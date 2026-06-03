import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const fromEmail = process.env.EMAIL_USER || 'sanyamsj30@gmail.com';

  // 1. BREVO HTTP API Support (Recommended for Gmail single-sender without custom domain)
  if (process.env.BREVO_API_KEY) {
    try {
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
      return;
    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      throw new Error('Email could not be sent.');
    }
  }

  // 2. SENDGRID HTTP API Support (Alternative for Gmail single-sender)
  if (process.env.SENDGRID_API_KEY) {
    try {
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
      return;
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      throw new Error('Email could not be sent.');
    }
  }

  // 3. RESEND HTTP API Support
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

  // 4. Fallback to Nodemailer SMTP (e.g. for local development)
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
      from: `TattleTent <${fromEmail}>`,
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
