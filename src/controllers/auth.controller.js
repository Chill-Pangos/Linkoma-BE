const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.service");
const userService = require("../services/user.service");
const tokenService = require("../services/token.service");
const emailService = require("../services/email.service");
const httpStatus = require("http-status");

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);

  res.cookie("refreshToken", user.refresh.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: user.refresh.expires,
    path: '/',
  })

  res.status(200).json({
    user: user.user,
    accessToken: user.access,
  });
});

const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
  });
  
  await authService.logout(refreshToken);
  res.status(204).send();
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const resetToken = await authService.forgotPassword(email);

  await emailService.sendResetPasswordEmail(email, resetToken);
  res.status(204).send();
});

const resetPassword = catchAsync(async (req, res) => {
  const resetToken = req.params.resetToken;
  const { password } = req.body;

  await authService.resetPassword(resetToken, password);
  res.status(204).json({});
});

module.exports = {
  login,
  logout,
  forgotPassword,
  resetPassword,
};