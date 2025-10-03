import nodemailer from 'nodemailer';

/**
 * An asynchronous function to send an email.
 * @param {object} options - The email options.
 * @param {string} options.email - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.html - The HTML body of the email.
 */
const sendEmail = async (options) => {
  try {
    // 1. Create a transporter object using Gmail SMTP
    //    We are using credentials from the .env file
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Using Gmail as the service
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address from .env
        pass: process.env.EMAIL_PASS, // Your Gmail App Password from .env
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: `The Caravan Chronicle <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // 3. Send the email and wait for the result
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

  } catch (error) {
    console.error('Error sending email:', error);
    // In a real application, you might want to throw the error
    // to be handled by the calling function.
    throw new Error('Email could not be sent.');
  }
};

export default sendEmail;