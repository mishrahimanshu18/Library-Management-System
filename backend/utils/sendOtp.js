import nodemailer from "nodemailer";

const sendOtp = async (email, otp) => {
  try {
    console.log("Sending password reset OTP to:", email);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "EMAIL_USER or EMAIL_PASS is missing in environment variables"
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Library Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Library Management System - Password Reset OTP",

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>Password Reset OTP</title>
        </head>

        <body style="
          margin:0;
          padding:30px;
          background:#f5f0e5;
          font-family:Arial,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:auto;
            background:#ffffff;
            padding:35px;
            border-radius:15px;
            box-shadow:0 5px 20px rgba(0,0,0,0.08);
          ">

            <h2 style="color:#143d2e;">
              Library Management System
            </h2>

            <h3>Password Reset Request</h3>

            <p style="color:#555;line-height:1.6;">
              You requested to reset your password.
              Use the OTP below to continue.
            </p>

            <div style="
              margin:30px 0;
              text-align:center;
            ">

              <div style="
                display:inline-block;
                padding:18px 30px;
                background:#143d2e;
                color:white;
                font-size:32px;
                font-weight:bold;
                letter-spacing:8px;
                border-radius:10px;
              ">
                ${otp}
              </div>

            </div>

            <p style="color:#777;">
              This OTP is valid for <strong>5 minutes</strong>.
            </p>

            <p style="color:#777;">
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <hr style="
              border:none;
              border-top:1px solid #eee;
              margin:25px 0;
            " />

            <p style="color:#999;font-size:12px;">
              Library Management System
            </p>

          </div>

        </body>
        </html>
      `,
    });

    console.log("Password reset OTP sent successfully");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("Send OTP Error:", error);
    throw error;
  }
};

export default sendOtp;
