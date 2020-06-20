const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const linkRoutes = require('./routes/link.routes');
const redirectRoutes = require('./routes/redirect.routes');

const app = express();
app.use(express.json({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/link', linkRoutes);
app.use('/t', redirectRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    app.listen(PORT, () => console.log(`${config.get('app.start')} ${PORT}...`));
  } catch (error) {
    console.log(config.get('app.error'), error.message);
    process.exit(1);
  }
}

start();
