require('dotenv').config();
const methodOverride = require('method-override');
const express = require('express');
const BrotherRoutes = require('./routes/brother.js');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const adminRoutes = require('./routes/adminroute');
const multer = require('multer');
const path = require('path');

const app = express(); // Define app before using it

// Set up session middleware (using default MemoryStore)
app.use(session({
  secret: 'myKey0203910293-13-10-0-210',
  resave: false,
  saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.set('views', './views');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    // Rename the file with a unique name (timestamp + originalname)
    cb(null, Date.now() + '-' + file.originalname);
  }
});

app.use('/uploads', express.static('uploads'));
app.use(flash());

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(req.path, res.method);
  next();
});

app.use(methodOverride('_method'));
app.use('/api/brothers/home', BrotherRoutes);

app.get('/home', (req, res) => {
  res.render('home', { message: req.flash() });
});

// Uncomment and adjust if you have admin page
// app.get('/admin_page', (req, res) => {
//   res.render('admin_page', { message: req.flash() });
// });

app.use(adminRoutes);

// Connect to DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Database-connected = 1, Listening port = 1");
    });
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });
