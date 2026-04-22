const morgan = require("morgan");
const logger = require("../utils/logger");

const stream = {
  write: (message) => {
    const statusMatch = message.match(/ (\d{3}) /);
    const statusCode = statusMatch ? parseInt(statusMatch[1]) : 0;

    if (statusCode >= 500) logger.error(message.trim());
    else if (statusCode >= 400) logger.warn(message.trim());
    else logger.info(message.trim());
  },
};

// 👇 Just return the middleware function
const requestLogger = morgan(
  ":method 📢 :url :status :res[content-length] - :response-time ms",
  { stream }
);


// 👇 Export middlewares separately
module.exports =  requestLogger;
