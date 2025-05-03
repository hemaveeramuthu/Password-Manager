import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function FakeHome() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [newPassword, setNewPassword] = useState({ website: '', username: '', password: '' });
  const [editPassword, setEditPassword] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false); // State to toggle new password visibility
  const [showPasswords, setShowPasswords] = useState({}); // State to control visibility of each saved password

  // Fetch passwords from the server
  useEffect(() => {
    axios.get('http://localhost:5001/api/fake-home')
      .then(response => setPasswords(response.data))
      .catch(error => console.log(error));
  }, []);

  // Toggle visibility for new password input
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  // Toggle saved password visibility for a given ID
  const togglePasswordVisibility = (id) => {
    setShowPasswords(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  // Handle input changes for new password creation
  const handleChange = (e) => {
    setNewPassword({ ...newPassword, [e.target.name]: e.target.value });
  };

  // Create a new password
  const handleCreate = () => {
    axios.post('http://localhost:5001/api/passwords', newPassword)
      .then(response => setPasswords([...passwords, response.data]))
      .catch(error => console.log(error));
    setNewPassword({ website: '', username: '', password: '' }); // Reset form
  };

  // Delete password by ID
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5001/api/passwords/${id}`)
      .then(() => setPasswords(passwords.filter(p => p._id !== id)))
      .catch(error => console.log(error));
  };

  // Set a password for editing
  const handleEdit = (id) => {
    const password = passwords.find(p => p._id === id);
    setEditPassword(password);
  };

  // Update password
  const handleUpdate = () => {
    axios.put(`http://localhost:5001/api/passwords/${editPassword._id}`, editPassword)
      .then(response => {
        setPasswords(passwords.map(p => p._id === response.data._id ? response.data : p));
        setEditPassword(null); // Clear editing state
      })
      .catch(error => console.log(error));
  };

  const goToAccountManagement = () => {
    navigate('/account-management');
  };

  // Function to generate a random password
  const generatePassword = () => {
    const length = 12; // Define password length
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    setNewPassword(prevState => ({ ...prevState, password: generatedPassword }));
  };

  return (
    <div>
      <h1>Fake Home</h1>
      <button onClick={goToAccountManagement} className="profile-button">Profile</button>

      <div>
        <h2>Add New Password</h2>
        <input 
          type="text" 
          name="website" 
          placeholder="Website" 
          value={newPassword.website} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={newPassword.username} 
          onChange={handleChange} 
        />
        <div className="password-input">
          <input 
            type={showNewPassword ? "text" : "password"}
            name="password" 
            placeholder="Password" 
            value={newPassword.password} 
            onChange={handleChange} 
          />
          <button onClick={toggleNewPasswordVisibility} className="eye-button">
            {showNewPassword ? '👁' : '🙈'}
          </button>
        </div>
        <button onClick={generatePassword} className="generate-button">Generate Password</button>
        <button onClick={handleCreate}>Add Password</button>
      </div>

      {editPassword && (
        <div>
          <h2>Edit Password</h2>
          <input 
            type="text" 
            name="website" 
            value={editPassword.website} 
            onChange={(e) => setEditPassword({ ...editPassword, website: e.target.value })} 
          />
          <input 
            type="text" 
            name="username" 
            value={editPassword.username} 
            onChange={(e) => setEditPassword({ ...editPassword, username: e.target.value })} 
          />
          <input 
            type="password" 
            name="password" 
            value={editPassword.password} 
            onChange={(e) => setEditPassword({ ...editPassword, password: e.target.value })} 
          />
          <button onClick={handleUpdate}>Update Password</button>
        </div>
      )}

      <h2>Your Saved Passwords</h2>
      <ul>
        {passwords.map((password) => (
          <li key={password._id}>
            <strong>{password.website}</strong>: {password.username} 
            <span>
              {showPasswords[password._id] ? password.password : '••••••••'}
              <button onClick={() => togglePasswordVisibility(password._id)} className="eye-button">
                {showPasswords[password._id] ? '👁' : '🙈'}
              </button>
            </span>
            <button onClick={() => handleDelete(password._id)}>Delete</button>
            <button onClick={() => handleEdit(password._id)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FakeHome;
