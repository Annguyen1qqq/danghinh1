const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Hardcoded user list
const users = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'user', password: 'user', role: 'user' },
];

// Set up body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the public directory

// Set up session middleware
app.use(session({
  secret: '1966', // Change this to a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public')); // Assuming your views are in a folder named "views"

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original filename
  }
});
const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// ** Middleware for admin check **
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).send('Forbidden: You do not have permission to delete files.');
  }
}

// Route to upload a folder of files
app.post('/upload-folder', upload.array('files'), (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
  res.redirect('/');
});

// Route to upload a single image or video
app.post('/upload-single', upload.single('singleFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file was uploaded.');
  }
  res.redirect('/');
});

// ** Route to delete a file with admin check **
app.post('/delete/:filename', isAdmin, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error deleting file.');
    }
    res.redirect('/');
  });
});

// Route to get the list of uploaded files
app.get('/', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory: ' + err);
    }
    res.render('index', { files }); // Assuming you're using EJS to render
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    req.session.user = user; // Set user in session
    res.redirect('/');
    
    
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
