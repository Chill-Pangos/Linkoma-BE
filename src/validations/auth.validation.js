const Joi = require("joi");
const { password } = require("./custom.validation");

const login = {
    body: Joi.object({ 
        email: Joi.string().email().required().messages({
            "string.email": "Invalid email format",
            "string.empty": "Email cannot be empty",
            "any.required": "Email is required"
        }),
        password: Joi.string().custom(password).required().messages({
            "any.required": "Password is required",
            "string.empty": "Password cannot be empty",
        })
    })
}

const logout = { 
    cookies: Joi.object({
        refreshToken: Joi.string().required().messages({
            "string.empty": "Refresh token cannot be empty",
            "any.required": "Refresh token is required",  
        })
    }).unknown(true)    
}

const forgotPassword = {
    body: Joi.object({
        email: Joi.string().email().required().messages({
            "string.email": "Invalid email format",
            "string.empty": "Email cannot be empty",
            "any.required": "Email is required"
        })
    })
}

const resetPassword = {
    params: Joi.object({
        resetToken: Joi.string().required().messages({
            "string.empty": "Reset token cannot be empty",
            "any.required": "Reset token is required"
        })
    }),
    body: Joi.object({
        password: Joi.string().custom(password).required().messages({
            "any.required": "Password is required",
            "string.empty": "Password cannot be empty",
        })
    })
}

module.exports = {
    login,
    logout,
    forgotPassword,
    resetPassword
};