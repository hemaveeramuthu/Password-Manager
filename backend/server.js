const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Twilio credentials
const accountSid = 'AC7ea58a2268cb1aebbd41c0d342e6c5ed';
const authToken = '62c715033ed0a2745c0bc5b79e633ccf';
const serviceSid = 'VAfaad3504fa33c9cc42fc0adc8eac644b';
const client = twilio(accountSid, authToken);

// MongoDB connection string (your MongoDB URI)
const mongoURI = 'mongodb+srv://user1:karan@cluster1.bozbp.mongodb.net/';

// MongoDB connection setup
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });

// User schema with phone number, hashed password, and location
const userSchema = new mongoose.Schema({
  phoneNumber: String,
  password: String,  // Store hashed password
  location: {
    latitude: Number,
    longitude: Number,
  },
});

const User = mongoose.model('User', userSchema);

// Helper function to sanitize phone numbers by removing non-numeric characters
function sanitizePhoneNumber(phoneNumber) {
  return phoneNumber.replace(/\D/g, ''); // Removes all non-numeric characters
}

// Route to send OTP for login or account creation
app.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });
    res.json({ success: true, status: verification.status });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to verify OTP and create account or login
app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp, password, latitude, longitude } = req.body;

  try {
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phoneNumber, code: otp });

    if (verificationCheck.status === 'approved') {
      const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumber);
      
      // Check if user exists
      let user = await User.findOne({ phoneNumber: sanitizedPhoneNumber });

      if (!user) {
        // User does not exist, create new account
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash password before saving
        user = new User({
          phoneNumber: sanitizedPhoneNumber,
          password: hashedPassword,
          location: { latitude, longitude },  // Store location on account creation
        });
        await user.save();
        return res.json({ success: true, message: 'Account created successfully!' });
      } else {
        // User exists, check password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
          return res.json({ success: true, message: 'Login successful!' });
        } else {
          // Password is incorrect, now check location
          if (user.location.latitude === latitude && user.location.longitude === longitude) {
            return res.json({ success: true, message: 'Location verified, but password is incorrect' });
          } else {
            return res.status(400).json({ success: false, message: 'Invalid password and location' });
          }
        }
      }
    } else {
      return res.status(400).json({ success: false, message: 'OTP verification failed' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));
