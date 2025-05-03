import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage';
import Dashboard from './Dashboard';
import AccountManagement from './AccountManagement';
import FakeHome from './FakeHome';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account-management" element={<AccountManagement />} />
        <Route path="/fake-home" element={<FakeHome />} />
      </Routes>
    </Router>
  );
}

export default App;
