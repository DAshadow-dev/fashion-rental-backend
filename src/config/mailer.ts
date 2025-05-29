import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const subject = "Verify your email";
  const text = "Please verify your email by clicking the button in the email.";
  const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Verify Your Email</h2>
            <p>Please click the button below to verify your email address:</p>
            <a href="${process.env.FRONTEND_URL}/verify/${token}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
                Verify Email
            </a>
        </div>
    `;
  await sendEmail(to, subject, text, html);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const subject = "Reset your password";
  const text =
    "Please reset your password by clicking the button in the email.";
  const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>Please click the button below to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password/${token}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
                Reset Password
            </a>
        </div>
    `;
  await sendEmail(to, subject, text, html);
};
