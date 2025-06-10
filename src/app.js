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
const apiError = require("./utils/apiError");

require("dotenv").config();

const app = express();

// Trust proxy to handle X-Forwarded-For headers properly for rate limiting
app.set('trust proxy', 1);

// Enhanced CORS for React Native compatibility - secure configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, React Native)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost and common React Native origins
    if (config.env === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:19000', // Expo
        'http://localhost:19006', // Expo web
        'http://localhost:8081',  // Metro bundler
        'http://10.0.2.2:8081',   // Android emulator
        'http://10.0.2.2:3000',   // Android emulator
        'http://10.0.2.2:19000',  // Android emulator Expo
      ];
      
      // Allow localhost with any port
      if (origin.match(/^https?:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      
      // Allow local network IPs for React Native development
      if (origin.match(/^https?:\/\/192\.168\.\d+\.\d+:\d+$/)) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // In production, only allow specific origins
    const productionOrigins = [config.frontendUrl].filter(Boolean);
    if (productionOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject unknown origins in production
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'User-Agent'
  ],
  exposedHeaders: [
    'Authorization', 
    'X-Total-Count',
    'Content-Range'
  ],
}));

app.options(
  /(.*)/,
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, React Native)
      if (!origin) return callback(null, true);
      
      // In development, allow localhost and common React Native origins
      if (config.env === 'development') {
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:19000', // Expo
          'http://localhost:19006', // Expo web
          'http://localhost:8081',  // Metro bundler
          'http://10.0.2.2:8081',   // Android emulator
          'http://10.0.2.2:3000',   // Android emulator
          'http://10.0.2.2:19000',  // Android emulator Expo
        ];
        
        // Allow localhost with any port
        if (origin.match(/^https?:\/\/localhost:\d+$/)) {
          return callback(null, true);
        }
        
        // Allow local network IPs for React Native development
        if (origin.match(/^https?:\/\/192\.168\.\d+\.\d+:\d+$/)) {
          return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
      }
      
      // In production, only allow specific origins
      const productionOrigins = [config.frontendUrl].filter(Boolean);
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Reject unknown origins in production
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type', 
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'User-Agent'
    ],
    exposedHeaders: [
      'Authorization', 
      'X-Total-Count',
      'Content-Range'
    ],
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

// Security headers optimized for React Native
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsers
app.use(express.json());                         
app.use(express.urlencoded({ extended: true })); 

// React Native compatibility middleware
app.use((req, res, next) => {
  // Set additional headers for React Native apps
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Handle JSON responses for React Native
  const originalJson = res.json;
  res.json = function(obj) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, obj);
  };
  
  next();
});

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
  next(new apiError(404, 'Route not found'));
});

// Convert error to apiError instance
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

module.exports = app;
