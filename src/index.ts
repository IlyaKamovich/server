import express from 'express';
import mongoose from 'mongoose';

const config = require('./config/app');

const app = express();
//config.express(app);
//config.routes(app);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'WORK' });
});

const { mongoUri } = config.app;

const PORT = process.env.PORT || 3000;

const runServer = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    app.listen(PORT, () => console.log(`Server started: http://localhost:${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

runServer();
