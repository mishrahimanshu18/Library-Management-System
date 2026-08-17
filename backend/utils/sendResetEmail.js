import { createTransport } from "nodemailer";

const sendResetEmail = async (email, resetToken) => {
  console.log("Sending password reset email to:", email);

  // Check environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASS is missing in environment variables"
    );
  }

  // Production frontend URL
  const resetLink =
    `https://library-management-system-snowy-six.vercel.app/reset-password/${resetToken}`;

  // Gmail transporter
  const transporter = createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send email
  const info = await transporter.sendMail({
    from: `"Library Management System" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "Library Management System - Password Reset",

    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
      </head>

      <body style="
        margin:0;
        padding:30px;
        background:#f5f5f5;
        font-family:Arial,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          padding:35px;
          border-radius:12px;
          box-shadow:0 2px 10px rgba(0,0,0,0.08);
        ">

          <h2 style="
            color:#143d2e;
            margin-bottom:20px;
          ">
            Library Management System
          </h2>

          <h3>
            Password Reset Request
          </h3>

          <p>
            You requested to reset your password.
          </p>

          <p>
            Click the button below to create a new password.
          </p>

          <div style="margin:30px 0;">

            <a
              href="${resetLink}"
              style="
                display:inline-block;
                background:#143d2e;
                color:#ffffff;
                padding:14px 24px;
                text-decoration:none;
                border-radius:7px;
                font-weight:bold;
              "
            >
              Reset Password
            </a>

          </div>

          <p>
            This password reset link will expire in
            <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request this password reset,
            you can safely ignore this email.
          </p>

          <hr style="
            border:none;
            border-top:1px solid #eeeeee;
            margin:30px 0;
          " />

          <p style="
            font-size:12px;
            color:#777777;
          ">
            Library Management System
          </p>

        </div>

      </body>
      </html>
    `,
  });

  console.log("Reset password email sent successfully");
  console.log("Message ID:", info.messageId);

  return info;
};

export default sendResetEmail;