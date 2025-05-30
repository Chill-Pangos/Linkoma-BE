const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.service");
const userService = require("../services/user.service");
const tokenService = require("../services/token.service");
const { status } = "http-status";

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  res.status(status.OK).json({
    user: user.user,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
  });
});

const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  await authService.logout(refreshToken);
  res.status(status.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = await tokenService.refreshAuthToken(refreshToken);
  res.status(status.OK).json({
    user: user.user,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(status.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  const resetToken = req.params.resetToken;
  const { password } = req.body;

  const user = await authService.resetPassword(resetToken, password);
  res.status(status.NO_CONTENT).json({});
});

module.exports = {
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
};