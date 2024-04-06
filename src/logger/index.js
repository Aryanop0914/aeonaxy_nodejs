const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, status_Code, timestamp }) => {
  return `${timestamp} [${status_Code}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new transports.File({ filename: "error.logs", level: "error" })],
});

module.exports = logger;
