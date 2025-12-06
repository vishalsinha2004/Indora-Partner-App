import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import PartnerLogin from './pages/PartnerLogin';
import Dashboard from './pages/Dashboard';
import ActiveOrder from './pages/ActiveOrder';
import Verification from './pages/Verification';
import API from './api';

// 🔒 Security Guard Component
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await API.get('/partners/me');
        if (res.data.isVerified) {
          setVerified(true);
        } else {
          // If NOT verified, force them to upload docs
          navigate('/verify'); 
        }
      } catch (err) {
        // If not logged in, force to login
        navigate('/'); 
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [navigate]);

  if (loading) return <div style={{padding: '20px'}}>Checking Verification Status...</div>;
  return verified ? children : null;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<PartnerLogin />} />
        
        {/* Verification Route */}
        <Route path="/verify" element={<Verification />} />

        {/* Protected Routes (Only Verified Drivers can see these) */}
        <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        <Route path="/active" element={
            <ProtectedRoute><ActiveOrder /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;