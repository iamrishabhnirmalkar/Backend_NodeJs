import rateLimit from 'express-rate-limit';
import responseMessage from '../constants/responseMessage';
import config from '../config/config';

const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: responseMessage.TOO_MANY_REQUESTS || 'Too many requests, please try again later.',
      data: null,
    });
  },
});

export default rateLimiter;
