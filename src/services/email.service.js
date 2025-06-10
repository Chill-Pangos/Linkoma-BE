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
        subject: 'Đặt lại mật khẩu',
        html: `
            <h1>Đặt lại mật khẩu</h1>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
            <a href="${resetUrl}">Đặt lại mật khẩu</a>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
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
        subject: 'Tài khoản của bạn đã được tạo',
        html: `
            <h1>Tài khoản của bạn đã được tạo</h1>
            <p>Tài khoản của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập của bạn:</p>
            <p>Email: ${toEmail}</p>
            <p>Mật khẩu: ${password}</p>
            <p>Vui lòng đăng nhập và thay đổi mật khẩu của bạn ngay lập tức.</p>
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
