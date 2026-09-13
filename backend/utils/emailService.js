const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (toEmail, code) => {
  const logoUrl = process.env.EMAIL_LOGO_URL
    || (process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL.replace(/\/$/, '')}/vastmart-email-logo.svg` : '');
  const from = process.env.EMAIL_FROM || 'VastMart <onboarding@resend.dev>';
  await resend.emails.send({
    from,
    to: toEmail,
    subject: 'Your secure VastMart password reset code',
    html: `
      <div style="margin:0;background:#f6f3ff;padding:36px 16px;font-family:Arial,sans-serif;color:#181330;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e8e1ff;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(37,28,67,.08);">
          <div style="position:relative;padding:28px 32px;background:linear-gradient(135deg,#20173f,#5b3df5);color:#ffffff;">
            ${logoUrl ? `<img src="${logoUrl}" alt="VastMart" width="150" style="display:block;max-width:150px;height:auto;margin-bottom:24px;">` : '<div style="font-size:24px;font-weight:800;letter-spacing:-1px;margin-bottom:24px;">Vast<span style="color:#cfc5ff;">Mart</span></div>'}
            <div style="position:absolute;right:18px;bottom:-18px;color:rgba(255,255,255,.1);font-size:72px;font-weight:900;letter-spacing:-6px;">VM</div>
            <p style="margin:0 0 8px;color:#dcd4ff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Account security</p>
            <h1 style="margin:0;font-size:25px;line-height:1.2;">Reset your password</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">We received a request to reset your VastMart password. Enter this one-time code to continue:</p>
            <div style="background:#f0ecff;border:1px solid #ddd3ff;padding:20px;border-radius:14px;text-align:center;margin:22px 0;">
              <span style="font-size:34px;font-weight:800;letter-spacing:10px;color:#20173f;">${code}</span>
            </div>
            <p style="margin:0;color:#6b6478;font-size:13px;line-height:1.6;">This code expires in <strong>10 minutes</strong> and can only be used once. Never share it with anyone.</p>
            <p style="margin:24px 0 0;color:#9a93aa;font-size:12px;line-height:1.6;">If you did not request this, you can safely ignore this message. Your password will remain unchanged.</p>
          </div>
          <div style="padding:16px 32px;background:#faf9ff;border-top:1px solid #eeeafb;color:#9a93aa;font-size:11px;">VastMart account security · This is an automated message</div>
        </div>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };