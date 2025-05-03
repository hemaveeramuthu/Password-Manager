// AccountManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AccountManagement() {
  const [locations, setLocations] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  
  const navigate = useNavigate();  // Using the useNavigate hook for navigation

  // Get all saved locations from the server
  useEffect(() => {
    axios.get('http://localhost:5001/api/locations')
      .then(response => setLocations(response.data))
      .catch(error => console.log(error));
  }, []);

  // Save the current location with a name
  const handleSaveLocation = () => {
    const newLocation = {
      name: locationName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    
    axios.post('http://localhost:5001/api/locations', newLocation)
      .then(response => setLocations([...locations, response.data]))
      .catch(error => console.log(error));

    setLocationName('');
    setLatitude('');
    setLongitude('');
  };

  // Get the current geolocation of the user
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentPosition(position.coords);
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    }, (error) => {
      console.log(error);
      alert('Could not get current location');
    });
  };

  // Delete a location
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5001/api/locations/${id}`)
      .then(() => setLocations(locations.filter(location => location._id !== id)))
      .catch(error => console.log(error));
  };

  // Handle logout (redirect to login page using navigate)
  const handleLogout = () => {
    // Assuming you clear the session or token here if applicable
    navigate('/'); // Navigate to login page
  };

  return (
    <div>
      <h1>Account Management</h1>

      

      <div>
        <h2>Save Current Location</h2>
        <button onClick={getCurrentLocation}>Get Current Location</button>
        {currentPosition && (
          <div>
            <p>Latitude: {currentPosition.latitude}</p>
            <p>Longitude: {currentPosition.longitude}</p>
          </div>
        )}

        <input
          type="text"
          placeholder="Location Name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        <input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
        <button onClick={handleSaveLocation}>Save Location</button>
      </div>

      <h2>Saved Locations</h2>
      <ul>
        {locations.map(location => (
          <li key={location._id}>
            <strong>{location.name}</strong>: {location.latitude}, {location.longitude}
            <button onClick={() => handleDelete(location._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default AccountManagement;
