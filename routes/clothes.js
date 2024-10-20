const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB setup
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'ecommerce';

// Connect to database
async function getDB() {
  if (!db) await connectDB();
  return db;
}

// GET all clothes
router.get('/', async (req, res) => {
  try {
    const db = await connectToDB();
    const clothes = await db.collection('clothes').find().toArray();
    res.json(clothes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve clothes' });
  }
});

// GET a specific clothing item by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await connectToDB();
    const item = await db.collection('clothes').findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ message: 'Clothing item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve item' });
  }
});

// POST a new clothing item
router.post('/', async (req, res) => {
  try {
    const { name, size, brand, price, color } = req.body;
    const db = await connectToDB();
    const result = await db.collection('clothes').insertOne({ name, size, brand, price, color });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create clothing item' });
  }
});

// PUT (update) a clothing item
router.put('/:id', async (req, res) => {
  try {
    const { name, size, brand, price, color } = req.body;
    const db = await connectToDB();
    const result = await db.collection('clothes').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, size, brand, price, color } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Clothing item not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update clothing item' });
  }
});

// DELETE a clothing item
router.delete('/:id', async (req, res) => {
  try {
    const db = await connectToDB();
    const result = await db.collection('clothes').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Clothing item not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete clothing item' });
  }
});

module.exports = router;