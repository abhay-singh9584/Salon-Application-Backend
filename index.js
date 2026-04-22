require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./src/routes');
const config = require("./config/config");
const morganMiddleware= require('./src/middlewares/morganLogger')
const logger= require('./src/utils/logger')
const sendResponse= require("./src/utils/responseUtil")
const helmet = require('helmet');

const app = express();
const port = config.PORT || 3000;
const mongoURI = config.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
// app.use((req, res, next) => {
//   console.log(`📢 ${req.method} request received at ${req.url}`);
//   next();
// });

//Logger
app.use(morganMiddleware);
app.use(helmet());

// Root Route
app.get('/', (req, res) => {
  sendResponse(res,200,"SUCCESS","🚀 Server is running successfully!")
});

// Other Routes
app.use('/', routes);

// MongoDB Connection
const connectDB = async () => {
  try {
    logger.info("🔄 Connecting to MongoDB...")
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("✅ MongoDB Connected Successfully")
    return true;
  } catch (error) {
    logger.error('❌ MongoDB Connection Failed:', error.message)
    return false;
  }
};

// Start Server
const startServer = async () => {
  const isConnected = await connectDB(); // Ensure DB is connected before starting the server

  if (isConnected) {
    app.listen(port, () => {
      console.log(`🚀 Server is up & running`);
    });
  } else {
    console.error('❌ Server startup aborted due to DB connection failure.');
    process.exit(1);
  }
};

startServer().catch(error => {
  console.error('❌ Fatal error during server startup:', error);
  process.exit(1);
});
