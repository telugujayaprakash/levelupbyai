const nodemailer = require('nodemailer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const nameFromEmail = (email) => {
  const local = email.split('@')[0];
  return local
    .split(/[._\-]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const parseSender = (senderStr) => {
  if (!senderStr) {
    return { name: "Level Up in tech", email: "jayaprakash2004@gmail.com" };
  }
  const match = senderStr.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
  if (match) {
    return {
      name: match[1]?.trim() || "Level Up in tech",
      email: match[2]?.trim()
    };
  }
  return {
    name: "Level Up in tech",
    email: senderStr
  };
};

const sendOtpEmail = async (email, otp) => {
  const htmlContent = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0D0E12;border-radius:16px;border:1px solid #232733">
      <h2 style="color:#ffffff;margin:0 0 8px">Level Up <span style="color:#4A5AF6">in tech</span></h2>
      <p style="color:#8E9AA8;font-size:14px;margin:0 0 24px">Your one-time verification code</p>
      <div style="background:#16181F;border:2px solid #4A5AF6;border-radius:12px;padding:24px;text-align:center">
        <span style="color:#4A5AF6;font-size:48px;font-weight:900;letter-spacing:16px">${otp}</span>
      </div>
      <p style="color:#8E9AA8;font-size:12px;margin:24px 0 0">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
  const subject = `Your Level Up verification code: ${otp}`;

  // If Brevo API Key is present in the environment, use Brevo HTTP API
  if (process.env.BREVO_API_KEY) {
    console.log('📬 Sending OTP using Brevo HTTP API...');
    const sender = parseSender(process.env.SMTP_FROM);
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender,
          to: [{ email }],
          subject,
          htmlContent
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Brevo API returned status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log('✅ OTP Email sent successfully via Brevo API key. Message ID:', resData.messageId);
      console.log(`\n🔑 OTP for ${email}: ${otp}\n`);
      return;
    } catch (apiError) {
      console.error('⚠️ Brevo API send failed, falling back to SMTP...', apiError);
    }
  }

  // Fallback to standard SMTP / Nodemailer transporter if API call fails or key is missing
  console.log('📬 Sending OTP using SMTP transporter fallback...');
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Dev fallback: Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Level Up in tech" <noreply@levelup.dev>',
    to: email,
    subject,
    html: htmlContent
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log('\n📧 OTP Email Preview:', preview);
  }
  console.log(`\n🔑 OTP for ${email}: ${otp}\n`);
};

module.exports = {
  nameFromEmail,
  sendOtpEmail
};
