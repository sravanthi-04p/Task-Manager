// Email dispatcher using Nodemailer (Gmail App Password by default).
// To use Resend/SendGrid instead: swap the transporter setup below and keep
// the sendTaskCreatedEmail/sendTaskCompletedEmail function signatures the same.
const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER/EMAIL_PASS not set - emails will be skipped, not sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) return; // email not configured - silently skip so the rest of the app still works

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
};

const sendTaskCreatedEmail = (userEmail, task) =>
  sendMail({
    to: userEmail,
    subject: `Task created: ${task.title}`,
    html: `<p>Your task <strong>${task.title}</strong> has been created.</p>
           <p>Status: ${task.status} | Priority: ${task.priority}</p>`,
  });

const sendTaskCompletedEmail = (userEmail, task) =>
  sendMail({
    to: userEmail,
    subject: `Task completed: ${task.title}`,
    html: `<p>Nice work! Your task <strong>${task.title}</strong> is marked as DONE.</p>`,
  });

module.exports = { sendTaskCreatedEmail, sendTaskCompletedEmail };
