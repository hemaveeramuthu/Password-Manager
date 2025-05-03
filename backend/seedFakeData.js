// Import necessary modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Database and salt configuration
const saltRounds = 10;
const dbName = 'user_919842619355';
const mongoURI = process.env.MONGO_URI || `mongodb+srv://user1:karan@cluster1.bozbp.mongodb.net/${dbName}?retryWrites=true&w=majority`;

// Define the schema and model for fake data
const fakeDashboardSchema = new mongoose.Schema({
  website: String,
  username: String,
  password: String,
});

const FakeDashboard = mongoose.model('FakeDashboard', fakeDashboardSchema, 'fake-home');

// Sample data function with hashed passwords
const fakePasswords = async () => [
  { website: 'examplebank.com', username: 'alice_smith', password: await bcrypt.hash('bankPass123!', saltRounds) },
  { website: 'shoponline.com', username: 'bob_jones', password: await bcrypt.hash('myShop2024!', saltRounds) },
  { website: 'emailservice.com', username: 'charlie_doe', password: await bcrypt.hash('secureEmail$', saltRounds) },
  { website: 'streamit.com', username: 'david_lee', password: await bcrypt.hash('streamFun$', saltRounds) },
  { website: 'cloudfiles.com', username: 'eve_taylor', password: await bcrypt.hash('cloud@1234', saltRounds) },
];

// Connect to MongoDB and insert fake data
const seedFakeData = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', dbName);

    const fakeData = await fakePasswords();
    await FakeDashboard.deleteMany({}); // Clear collection before inserting new data
    await FakeDashboard.insertMany(fakeData);

    console.log('Fake data inserted into fake-home collection');
  } catch (error) {
    console.error('Error inserting fake data:', error);
  } finally {
    await mongoose.disconnect(); // Close the connection after operation
    console.log('MongoDB connection closed');
  }
};

// Execute the seed function
seedFakeData();
