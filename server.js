
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true, 
    secure: false, // Set to true if you're using HTTPS
    maxAge: 60000 // Set a short expiry for the session cookie for testing
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration for GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  // You can save user info to the session or a database if needed
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db; // Declare a variable to hold the database connection

async function connectDB() {
  try {
    await client.connect();
    db = client.db('ecommerce'); // Set the db variable
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// Routes
app.use('/clothes', require('./routes/clothes'));
app.use('/coupons', require('./routes/coupons')); // Add the coupons route

// Home route (rendering clothes)
app.get('/', async (req, res) => {
  try {
    const clothes = await db.collection('clothes').find().toArray();
    res.render('index', { clothes });
  } catch (err) {
    console.error('Error retrieving clothes:', err);
    res.status(500).send('Error retrieving clothes');
  }
});

// GitHub OAuth routes
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/coupons'); // Redirect to the coupons page after successful login
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // Destroy session and redirect to GitHub's logout
    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session:", err);
      }
      // GitHub logout doesn't have an official route, so we simulate it by redirecting to GitHub's logout page.
      res.redirect('https://github.com/logout');
    });
  });
});



// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/github');
}

// Coupons route, only accessible after login
app.get('/coupons', isAuthenticated, async (req, res) => {
  try {
    const db = await connectDB();
    const coupons = await db.collection('coupons').find().toArray();
    const username = req.user.username; // Assuming you want to pass the username to the template
    res.render('coupons', { coupons, username });
  } catch (err) {
    console.error('Error retrieving coupons:', err);
    res.status(500).send('Error retrieving coupons');
  }
});

// Start the server and connect to MongoDB
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running at http://localhost:${port}`);
});

app.use(express.static('ecommerce-api'));
