const {
  sendResetPasswordEmail,
  resetUserPassword,
} = require("../services/passwordService");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await sendResetPasswordEmail(email);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body; 

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const response = await resetUserPassword(token, password);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
