
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB setup
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'ecommerce';
let db;

// Connect to database
async function connectToDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(dbName);
    } catch (err) {
      console.error('Error connecting to database:', err);
    }
  }
  return db;
}

// GET all coupons
router.get('/', async (req, res) => {
  try {
    const db = await connectToDB();
    const coupons = await db.collection('coupons').find().toArray();
    
    // Get the GitHub username from the session (from Passport.js)
    const username = req.isAuthenticated() ? req.user.login : 'Guest'; // This assumes you are using the 'login' field from GitHub profile
    
    res.render('coupons', { coupons, username }); // Pass the coupons and username to the EJS template
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve coupons' });
  }
});

module.exports = router;
