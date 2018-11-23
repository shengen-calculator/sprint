import winston from 'winston';

export const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export const infoLogger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});
