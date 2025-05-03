const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5001;

// MongoDB connection with a specific database
const dbName = 'user_919842619355'; // Specify your desired database name here
const mongoURI = process.env.MONGO_URI || `mongodb+srv://user1:karan@cluster1.bozbp.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected to database:', dbName))
  .catch(err => console.log('MongoDB connection error:', err));

// Dashboard Schema
const dashboardSchema = new mongoose.Schema({
  website: String,
  username: String,
  password: String,
});
const Dashboard = mongoose.model('Dashboard', dashboardSchema, 'dashboards');  // 'dashboards' is the collection name

// Fake Dashboard Schema
const fakeDashboardSchema = new mongoose.Schema({
  website: String,
  username: String,
  password: String,
});
const FakeDashboard = mongoose.model('FakeDashboard', fakeDashboardSchema, 'fake-home');  // 'fake-home' is the collection name

// Location Schema
const locationSchema = new mongoose.Schema({
  name: String,
  latitude: Number,
  longitude: Number,
});
const Location = mongoose.model('Location', locationSchema, 'locations');  // 'locations' is the collection name

// CRUD Routes for Passwords
// Create
app.post('/api/passwords', async (req, res) => {
  const { website, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newPassword = new Dashboard({ website, username, password: hashedPassword });
  await newPassword.save();
  res.status(201).send(newPassword);
});

// Read
app.get('/api/passwords', async (req, res) => {
  const passwords = await Dashboard.find();
  res.status(200).send(passwords);
});

// Update
app.put('/api/passwords/:id', async (req, res) => {
  const { website, username, password } = req.body;
  const updateData = { website, username };

  if (password) {
    updateData.password = await bcrypt.hash(password, saltRounds);
  }

  const updatedPassword = await Dashboard.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.status(200).send(updatedPassword);
});

// Delete
app.delete('/api/passwords/:id', async (req, res) => {
  await Dashboard.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Routes for Fake Passwords
app.get('/api/fake-home', async (req, res) => {
  const fakePasswords = await FakeDashboard.find();
  res.status(200).send(fakePasswords);
});

// CRUD Routes for Locations
// Create a new location
app.post('/api/locations', async (req, res) => {
  const { name, latitude, longitude } = req.body;
  const newLocation = new Location({ name, latitude, longitude });
  await newLocation.save();
  res.status(201).send(newLocation);
});

// Get all locations
app.get('/api/locations', async (req, res) => {
  const locations = await Location.find();
  res.status(200).send(locations);
});

// Delete a location by ID
app.delete('/api/locations/:id', async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Optional Sample Data Seeding (Uncomment to use)
// const sampleDashboards = [
//   { website: 'google.com', username: 'john_doe', password: await bcrypt.hash('password123', saltRounds) },
//   // Additional sample passwords...
// ];
// const sampleLocations = [
//   { name: 'New York City', latitude: 40.7128, longitude: -74.0060 },
//   // Additional sample locations...
// ];
// const seedSampleData = async () => {
//   try {
//     await Dashboard.deleteMany({});
//     await FakeDashboard.deleteMany({});
//     await Location.deleteMany({});
//     await Dashboard.insertMany(sampleDashboards);
//     await Location.insertMany(sampleLocations);
//     console.log('Sample data inserted into Dashboard and Location collections');
//   } catch (error) {
//     console.error('Error inserting sample data:', error);
//   }
// };
// Uncomment the line below to seed data after connection
// mongoose.connection.once('open', seedSampleData);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
