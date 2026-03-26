import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"Joma" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your login code for Joma",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.05em;">Your login code</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 32px;">
          Enter this code to sign in to your Joma account. It expires in 10 minutes.
        </p>
        <div style="background: #f4f4f4; border-radius: 4px; padding: 24px; text-align: center; letter-spacing: 0.4em; font-size: 36px; font-weight: 700; font-family: monospace; color: #111;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
