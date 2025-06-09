const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const {xss} = require('express-xss-sanitizer')
const compression = require("compression");
const passport = require("passport");
const { jwtStrategy } = require("./config/passport");
const cookieParser = require("cookie-parser");
const routes = require("./routes/v1");
const config = require("./config/config");
const rateLimit = require("express-rate-limit");
const { errorConverter, errorHandler } = require("./middlewares/error.middleware");

require("dotenv").config();

const app = express();

// Trust proxy to handle X-Forwarded-For headers properly for rate limiting
app.set('trust proxy', 1);

// enable CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  exposedHeaders: ['Authorization'],
}));
app.options(
  /(.*)/,
  cors({
    origin: config.frontendUrl,
    credentials: true,
    exposedHeaders: ['Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use(limiter);

// Security headers 
app.use(helmet());

// Body parsers
app.use(express.json());                         
app.use(express.urlencoded({ extended: true })); 

// Cookie parser 
app.use(cookieParser());

// Sanitize 
app.use(xss()); 

// Logger
app.use(morgan('dev'));

// Compression
app.use(compression());

// Passport
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Routes
app.use('/v1', routes);

// Handle 404 errors
app.use((req, res, next) => {
  const apiError = require("./utils/apiError");
  next(new apiError(404, 'Route not found'));
});

// Convert error to apiError instance
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

module.exports = app;
