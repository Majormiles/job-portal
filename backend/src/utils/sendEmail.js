const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Define email options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send email
  await transporter.sendMail(message);
};

// Email templates
const getPasswordResetTemplate = (resetUrl) => {
  return `
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
    <p>Please click on the following link to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    <p>This link will expire in 10 minutes.</p>
  `;
};

const getWelcomeTemplate = (name) => {
  return `
    <h1>Welcome to Job Portal!</h1>
    <p>Hello ${name},</p>
    <p>Thank you for joining our platform. We're excited to have you on board!</p>
    <p>Here are some things you can do to get started:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Upload your resume</li>
      <li>Browse available jobs</li>
      <li>Set up job alerts</li>
    </ul>
    <p>If you have any questions, feel free to contact our support team.</p>
  `;
};

const getApplicationNotificationTemplate = (jobTitle, companyName) => {
  return `
    <h1>New Job Application</h1>
    <p>You have received a new application for the position of ${jobTitle} at ${companyName}.</p>
    <p>Please log in to your account to review the application and take necessary action.</p>
  `;
};

const getInterviewInvitationTemplate = (candidateName, jobTitle, companyName, dateTime, location) => {
  return `
    <h1>Interview Invitation</h1>
    <p>Dear ${candidateName},</p>
    <p>We are pleased to invite you for an interview for the position of ${jobTitle} at ${companyName}.</p>
    <p><strong>Interview Details:</strong></p>
    <ul>
      <li>Date and Time: ${dateTime}</li>
      <li>Location: ${location}</li>
    </ul>
    <p>Please confirm your attendance by replying to this email.</p>
    <p>If you need to reschedule, please let us know as soon as possible.</p>
  `;
};

module.exports = {
  sendEmail,
  getPasswordResetTemplate,
  getWelcomeTemplate,
  getApplicationNotificationTemplate,
  getInterviewInvitationTemplate
}; 