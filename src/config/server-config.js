const getRateLimiter = () => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 0, // limit each IP in production
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    }
  });
};

const getMongooseOptions = () => ({
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  autoIndex: process.env.NODE_ENV !== 'production',
  retryWrites: true
});

export { getMongooseOptions, getRateLimiter };

