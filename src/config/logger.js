const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.MongoDB({
      db: process.env.MONGO_URL,
      options: { useUnifiedTopology: true },
      collection: "logs", // Name of the collection to store logs
      capped: true, // Whether to cap the size of the collection. Default is false.
      cappedMax: 10000000, // Maximum size of the capped collection in bytes. Default is 10000000 (10 MB).
      decolorize: true, // Whether to strip ANSI color codes. Default is true.
    }),
  ],
});

module.exports = logger;
