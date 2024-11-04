// const express = require('express');
// const { MongoClient } = require('mongodb');
// require('dotenv').config();
// const swaggerUi = require('swagger-ui-express');
// const swaggerFile = require('./swagger-output.json');

// const app = express();
// const port = process.env.PORT || 4000;

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Set the view engine to EJS
// app.set('view engine', 'ejs');

// // Swagger docs
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// // Connect to MongoDB
// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri);
// let db; // Declare a variable to hold the database connection

// async function connectDB() {
//   try {
//     await client.connect();
//     db = client.db('ecommerce'); // Set the db variable
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('Error connecting to MongoDB:', err);
//   }
// }

// // Routes
// app.use('/clothes', require('./routes/clothes'));

// // Home route (rendering clothes)
// app.get('/', async (req, res) => {
//   try {
//     const clothes = await db.collection('clothes').find().toArray(); // Use the already connected db
//     res.render('index', { clothes });
//   } catch (err) {
//     console.error('Error retrieving clothes:', err);
//     res.status(500).send('Error retrieving clothes');
//   }
// });



// // Start the server
// app.listen(port, async () => {
//   await connectDB();
//   console.log(`Server running at http://localhost:${port}`);
// });


// // server.js
// require('dotenv').config();
// const express = require('express');
// const session = require('express-session');
// const passport = require('passport');
// const GitHubStrategy = require('passport-github').Strategy;

// const app = express();

// // Middleware for session handling
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true
// }));

// // Initialize Passport for OAuth
// app.use(passport.initialize());
// app.use(passport.session());

// // Passport configuration for GitHub
// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: process.env.GITHUB_CALLBACK_URL
// }, (accessToken, refreshToken, profile, done) => {
//   // Store user profile or access token if needed
//   done(null, profile);
// }));

// // Serialize and deserialize user to manage sessions
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//   done(null, obj);
// });

// // Redirects the user to GitHub for authentication
// app.get('/auth/github', passport.authenticate('github'));

// // GitHub callback URL after authentication
// app.get('/auth/github/callback',
//   passport.authenticate('github', { failureRedirect: '/' }),
//   (req, res) => {
//     // Successful authentication, redirect to the favorites page or desired route
//     res.redirect('/favorites');
//   }
// );

// // Logout route to end session
// app.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) { return next(err); }
//     res.redirect('/');
//   });
// });

// // Middleware to check if the user is logged in
// function isAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/auth/github');
// }

// // Favorites route, only accessible after login
// app.get('/favorites', isAuthenticated, (req, res) => {
//   // Render favorites page or return favorite items
//   res.send(`Hello ${req.user.username}, here are your favorite items!`);
// });

// server.js
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
  saveUninitialized: true
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
  done(null, profile); // Pass the profile to the session
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
    res.redirect('/favorites'); // Redirect after successful login
  }
);

// Logout route to end session
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { 
      console.error('Error during logout:', err);
      return next(err);
    }
    req.session.destroy(() => {
      res.redirect('/'); // Redirect to home after logging out
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

// Favorites route, only accessible after login
app.get('/favorites', isAuthenticated, (req, res) => {
  res.send(`Hello ${req.user.username}, here are your favorite items!`);
});

// Start the server and connect to MongoDB
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running at http://localhost:${port}`);
});