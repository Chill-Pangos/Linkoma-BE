const nodemailer = require('nodemailer');
const config = require('../config/config');
const { ApiError } = require('../utils/apiError');
const { status } = require('http-status');

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
        throw new ApiError(status.INTERNAL_SERVER_ERROR,'Failed to send reset password email');
    }
}

module.exports = {
    sendResetPasswordEmail, 
}