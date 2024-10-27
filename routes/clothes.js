const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const { clothingItemSchema } = require('../validation/validation'); // Adjust the path if needed
const { ValidationError } = require('yup'); // Assuming you're using Yup for validation
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

// GET all clothes
/**
 * @swagger
 * /clothes:
 *   get:
 *     description: Get all clothes
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Failed to retrieve clothes
 */
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
/**
 * @swagger
 * /clothes/{id}:
 *   get:
 *     description: Get a clothing item by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Clothing item not found
 *       500:
 *         description: Failed to retrieve item
 */
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
/**
 * @swagger
 * /clothes:
 *   post:
 *     description: Add a new clothing item
 *     parameters:
 *       - name: body
 *         in: body
 *         description: New clothing item data
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             size:
 *               type: string
 *             brand:
 *               type: string
 *             price:
 *               type: number
 *             color:
 *               type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to create clothing item
 */

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
/**
 * @swagger
 * /clothes/{id}:
 *   put:
 *     description: Update an existing clothing item
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: Updated clothing item data
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             size:
 *               type: string
 *             brand:
 *               type: string
 *             price:
 *               type: number
 *             color:
 *               type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Validation error
 *       404:
 *         description: Clothing item not found
 *       500:
 *         description: Failed to update clothing item
 */

// PUT (update) a clothing item
router.put('/:id', async (req, res) => {
  try {
    const { name, size, brand, price, color } = req.body;
    const db = await connectToDB();
    const result = await db.collection('clothes').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, size, brand, price, color } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    res.json({ message: 'Clothing item updated successfully', result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update clothing item' });
  }
});

// DELETE a clothing item
/**
 * @swagger
 * /clothes/{id}:
 *   delete:
 *     description: Delete a clothing item by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Clothing item not found
 *       500:
 *         description: Failed to delete clothing item
 */
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