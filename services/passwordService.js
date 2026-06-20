// services/authService.js
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// === Send Reset Password Email ===
const sendResetPasswordEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  // Email configuration (Gmail example)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Food Delivery Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <h3>Reset Your Password</h3>
      <p>Click the link below to reset your password (valid for 15 minutes):</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { message: "Password reset link sent to your email!" };
};

// === Reset User Password ===
const resetUserPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: "Password reset successful!" };
  } catch (err) {
    throw new Error("Invalid or expired reset token");
  }
};

module.exports = {
  sendResetPasswordEmail,
  resetUserPassword,
};
