import express from 'express';
import mongoose from 'mongoose';

const config = require('./config');

const app = express();
config.express(app);
config.routes(app);

const { port, mongoUri } = config.app;

const runServer = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    app.listen(port, () => console.log(`Server started: http://localhost:${port}`));
  } catch (error) {
    console.log(error);
  }
};

runServer();
