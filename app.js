const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//  import routes
const authRoute = require('./routes/auth')
const actionsRoute = require('./routes/actions')

dotenv.config();

// connect to DB
mongoose.connect(process.env.DB_CONNECT, 
        { useUnifiedTopology: true, useNewUrlParser: true },
     ()=>console.log("connected to db !")
     );

// middleware
app.use(express.json());

//Route middlewares,
app.use('/api/v1', authRoute);
app.use('/api/v1', actionsRoute);

app.listen(3000, ()=>console.log("server up and running"))