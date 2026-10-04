import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

const sendVerificationOtp = async (email, otp) => {
  const subject = "Verify your JobTrack email";

  const text = `Your JobTrack verification code is ${otp}. It expires in 10 minutes. If you did not create this account, you can ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin: 0 0 8px;">Verify your email</h2>
      <p style="color: #4b5563;">Use this code to verify your JobTrack account. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">${otp}</div>
      <p style="color: #9ca3af; font-size: 12px;">If you did not create this account, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};

export { sendEmail, sendVerificationOtp };
