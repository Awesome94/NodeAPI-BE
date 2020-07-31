const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoute = require('./routes/auth')
const actionsRoute = require('./routes/actions')

dotenv.config();

mongoose.connect(process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true });
app.use(express.json());

app.use('/api/v1', authRoute);
app.use('/api/v1', actionsRoute);

const port = process.env.PORT || 3000
app.listen(port)
