const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (toEmail, code) => {
  await resend.emails.send({
    from: 'VastMart <onboarding@resend.dev>', // Resend's shared sandbox sender — fine for dev
    to: toEmail,
    subject: 'Your VastMart password reset code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #5B3DF5;">VastMart</h2>
        <p>You requested to reset your password. Use the code below — it expires in 10 minutes.</p>
        <div style="background: #EFEBFF; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #181330;">${code}</span>
        </div>
        <p style="color: #6B6478; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };