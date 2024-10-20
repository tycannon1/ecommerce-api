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
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Connect to MongoDB
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
    const clothes = await db.collection('clothes').find().toArray(); // Use the already connected db
    res.render('index', { clothes });
  } catch (err) {
    console.error('Error retrieving clothes:', err);
    res.status(500).send('Error retrieving clothes');
  }
});

// Start the server
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running at http://localhost:${port}`);
});