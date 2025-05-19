const winston = require("winston");

const logger = winston.createLogger({
  level: "info", // mức log tối thiểu, ví dụ: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
  format: winston.format.combine(
    winston.format.colorize(), // tô màu log cho dễ đọc
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // thêm timestamp
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // xuất ra console
  ],
});

module.exports = logger;
