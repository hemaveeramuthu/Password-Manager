import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      await axios.post('http://localhost:5000/send-otp', { phoneNumber });
      setIsOtpSent(true);
      fetchLocation();  // Get location after sending OTP
    } catch (err) {
      console.error('Error sending OTP', err);
    }
  };

  // Function to fetch user's current location
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      const response = await axios.post('http://localhost:5000/verify-otp', { phoneNumber, otp, password, latitude, longitude });

      // If password is correct, just login
      if (response.data.success) {
        navigate('/dashboard');  // Redirect to dashboard on successful login
      } else {
        // If password is incorrect, check if the location matches
        if (response.data.message === 'Invalid password and location') {
          navigate('/fake-home');  // Redirect to fake home page if both password and location are incorrect
        } else {
          alert(response.data.message);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
      
      // If password is incorrect and location doesn't match, redirect to fake home page
      if (err.response?.data?.message === 'Invalid password and location') {
        navigate('/fake-home');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <h2>{isOtpSent ? 'Verify OTP and Enter Password' : 'Create Account or Login'}</h2>
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      {isOtpSent && (
        <>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}
      <button onClick={isOtpSent ? handleVerifyOtp : handleSendOtp} disabled={isVerifying}>
        {isOtpSent ? 'Verify OTP and Login/Create Password' : 'Send OTP'}
      </button>
    </div>
  );
}

export default LoginPage;
