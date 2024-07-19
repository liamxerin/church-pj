require('dotenv').config();
const methodOverride = require('method-override');
const express = require('express');
const BrotherRoutes = require('./routes/brother.js');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const adminRoutes = require('./routes/adminroute');
const RedisStore = require('connect-redis').default; // Correct import
const redisClient = require('redis').createClient();
const multer = require('multer');
const path = require('path');

const app = express(); // Define app before using it

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'myKey0203910293-13-10-0-210',
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(req.path, res.method);
  next();
});

app.use(methodOverride('_method'));

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    // Rename the file with a unique name (timestamp + originalname)
    cb(null, Date.now() + '-' + file.originalname);
  }
});

app.use('/api/brothers/home', BrotherRoutes);
app.get('/home', (req, res) => {
  res.render('home', { message: req.flash() });
});

app.use(adminRoutes);

// Connect to the database and start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Database connected and server is running on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });
