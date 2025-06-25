const nodemailer = require('nodemailer');
const config = require('../config/config');
const apiError = require('../utils/apiError');
const httpStatus= require('http-status');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.password,
    },
});

const sendResetPasswordEmail = async (toEmail, resetToken) => {
    const resetUrl = `${config.frontendUrl}/reset-password?${resetToken}`;

    const mailOptions = {
      from: `"Linkoma" <${config.email.user}>`,
      to: toEmail,
      subject: "Đặt lại mật khẩu",
      html: `
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8" />
            <title>Đặt lại mật khẩu - Linkoma</title>
          </head>
          <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f8; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #1890ff, #722ed1); padding: 24px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px;">🔐 Linkoma - Đặt lại mật khẩu</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 16px;">Xin chào bạn,</p>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">
                          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiếp tục quá trình.
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                          <a href="${resetUrl}" style="background: #1890ff; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                            👉 Đặt lại mật khẩu
                          </a>
                        </div>
                        <p style="font-size: 14px; color: #666; line-height: 1.5;">
                          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #fafafa; padding: 24px; text-align: center;">
                        <p style="font-size: 12px; color: #999;">
                          Email này được gửi từ hệ thống <strong>Linkoma</strong>. Vui lòng không trả lời trực tiếp email này.
                        </p>
                        <p style="font-size: 12px; color: #ccc;">
                          © 2025 Linkoma. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
    };
      

    try {
        await transporter.sendMail(mailOptions);

        return {
            message: 'Reset password email sent successfully',
        };
    } catch (error) {
        throw new apiError(500, error.message);
    }
}   

/**
 * @description Sends an email to the user with their account information after successful account creation
 *
 * @param {string} toEmail - The email address to send the account information to
 * @param {string} password - The password for the newly created account
 * @return {Object} - A message indicating success or failure
 * @throws {apiError} - If there is an error during the email sending process
 */

const sendAccountEmail = async (toEmail, password) => {
    const mailOptions = {
      from: `"Linkoma" <${config.email.user}>`,
      to: toEmail,
      subject: "Tài khoản của bạn đã được tạo",
      html: `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f8; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #1890ff, #722ed1); padding: 24px; text-align: center;">
                      <h1 style="color: #fff; margin: 0; font-size: 24px;">🎉 Tài khoản đã được tạo thành công!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px;">
                      <p style="font-size: 16px; color: #333; margin-bottom: 16px;">Xin chào bạn,</p>
                      <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        Chúng tôi rất vui thông báo rằng tài khoản của bạn trên hệ thống <strong>Linkoma</strong> đã được tạo thành công. Dưới đây là thông tin đăng nhập của bạn:
                      </p>
                      <div style="background: #f0f4ff; border-left: 4px solid #1890ff; padding: 16px 24px; border-radius: 8px; margin: 24px 0;">
                        <p style="font-size: 16px; margin: 0; color: #333;">
                          <span style="display: inline-block; width: 24px;">📧</span>
                          <strong>Email:</strong> <span style="color: #1890ff;">${toEmail}</span>
                        </p>
                        <p style="font-size: 16px; margin: 8px 0 0; color: #333;">
                          <span style="display: inline-block; width: 24px;">🔑</span>
                          <strong>Mật khẩu:</strong> <span style="color: #d4380d;">${password}</span>
                        </p>
                      </div>
      
                      <p style="font-size: 14px; color: #666;">
                        🚨 Vui lòng đăng nhập và thay đổi mật khẩu của bạn ngay lập tức để bảo mật tài khoản.
                      </p>
                      <div style="margin-top: 32px; text-align: center;">
                        <a href="https://linkoma.com/login" style="background: #1890ff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
                          🔐 Đăng nhập ngay
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #fafafa; padding: 24px; text-align: center;">
                      <p style="font-size: 12px; color: #999;">
                        Email này được gửi từ hệ thống <strong>Linkoma</strong>. Vui lòng không trả lời trực tiếp email này.
                      </p>
                      <p style="font-size: 12px; color: #ccc;">
                        © 2025 Linkoma. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `,
    };
      
      

    try {
        await transporter.sendMail(mailOptions);

        return {
            message: 'Account email sent successfully',
        };
    } catch (error) {
        throw new apiError(500, error.message);
    }
};

module.exports = {
    sendResetPasswordEmail,
    sendAccountEmail,
};
