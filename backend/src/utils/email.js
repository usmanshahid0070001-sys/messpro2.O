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

// 4. Onboarding Email Verification OTP Template
export const sendOtpEmail = async (userEmail, otp, userName = 'Resident') => {
  const subject = `MessPro - Email Verification Code: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Email Verification Code</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Hi ${userName}, use this 6-digit code to verify and bind your new email address to your MessPro account.</p>
      </div>
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #2563eb;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 16px;">This verification code is valid for 10 minutes. If you did not request this, you can safely ignore this message.</p>
    </div>
  `;

  await sendEmail({
    to: userEmail,
    subject,
    text: `Your MessPro verification code is: ${otp}. It will expire in 10 minutes.`,
    html,
  });
};