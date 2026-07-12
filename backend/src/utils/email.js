import nodemailer from 'nodemailer';

// 1. Codex's robust connection logic (Adapted specifically for Gmail)
const getTransporter = () => {
  // We default to Gmail's SMTP server if not provided
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'; 
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

// 2. Codex's generic email sender
export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  const from = `"MessPro Admin" <${process.env.EMAIL_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

// 3. OUR NEW SAAS FEATURE: The Auto-Provisioning Template
export const sendCredentialsEmail = async (userEmail, role, plainTextPassword, hostelName) => {
  const subject = `Welcome to MessPro - Your ${role.toUpperCase()} Credentials`;
  
  // A clean, professional HTML template for the email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #333;">Welcome to MessPro!</h2>
      <p style="color: #555; line-height: 1.5;">You have been securely provisioned as a <strong>${role}</strong> for <strong>${hostelName}</strong>.</p>
      <p style="color: #555; line-height: 1.5;">Here are your temporary login credentials. For security purposes, please log in and change your password immediately.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #0056b3; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #333;"><strong>Email:</strong> ${userEmail}</p>
        <p style="margin: 10px 0 0 0; color: #333;"><strong>Temporary Password:</strong> ${plainTextPassword}</p>
      </div>
      
      <p style="color: #555;">
        Click <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color: #0056b3; font-weight: bold;">here</a> to access the dashboard.
      </p>
    </div>
  `;

  // We call Codex's generic function using our specific data!
  await sendEmail({ to: userEmail, subject, html });
};