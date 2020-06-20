const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');
const linkRoutes = require('./routes/link.routes');
const redirectRoutes = require('./routes/redirect.routes');

const app = express();
app.use(express.json({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/link', linkRoutes);
app.use('/t', redirectRoutes);

require('dotenv').config();
console.log(process.env.PORT);
console.log(process.env.MONGO_URI);
console.log(process.env.JWT_SECRET);
console.log(process.env.BASE_URL);

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
    } catch (error) {
        console.log('Server error', error.message);
        process.exit(1);
    }
}

start();
