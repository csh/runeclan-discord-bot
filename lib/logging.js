import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/discord-hiscores-errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/discord-hiscores.log' })
  ]
});

export default logger;
