const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP.HOST,
      port: config.SMTP.PORT,
      secure: config.SMTP.PORT === 465,
      auth: {
        user: config.SMTP.USER,
        pass: config.SMTP.PASS
      }
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"${config.FROM_NAME}" <${config.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text
    };
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error.message);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetUrl, name) => {
  const subject = 'OpsPulse - Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset for your OpsPulse account.</p>
      <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px;">OpsPulse - Enterprise IT Operations Platform</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

const sendNotificationEmail = async (email, name, notification) => {
  const subject = `OpsPulse - ${notification.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">${notification.title}</h2>
      <p>Hello ${name},</p>
      <p>${notification.message}</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px;">OpsPulse - Enterprise IT Operations Platform</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendNotificationEmail };
