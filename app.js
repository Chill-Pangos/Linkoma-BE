const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const xss = require("xss-clean");
const compression = require("compression");

require("dotenv").config();

const app = express();

//enable cors
app.use(cors());
app.options(/(.*)/, cors());

//set security HTTP headers
app.use(helmet());

//parse json request body
app.use(express.json());

//parse urlencoded request body
app.use(express.urlencoded({ extended: true}))

//set HTTP requests logger
app.use(morgan("dev"));

//compress response bodies
app.use(compression());

//set xss clean
//app.use(xss());


module.exports = app;