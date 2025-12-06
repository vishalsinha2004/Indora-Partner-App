import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const PartnerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      
      // Force role to 'partner'
      const payload = isSignup 
        ? { name, email, password, phone, role: 'partner' } 
        : { email, password, role: 'partner' };

      // 1. Perform Login/Signup
      const res = await API.post(endpoint, payload);
      
      // 2. Save Token
      localStorage.setItem('partnerToken', res.data.token);
      
      alert(`Welcome ${res.data.name}!`);

      // 3. LOGIC FIX: Check where to send them
      if (isSignup) {
        // If they just registered, they are definitely NOT verified.
        navigate('/verify');
      } else {
        // If logging in, check their current status
        try {
          const profileRes = await API.get('/partners/me');
          if (profileRes.data.isVerified) {
             navigate('/dashboard');
          } else {
             navigate('/verify');
          }
        } catch (err) {
          // If checking profile fails, default to verify just in case
          navigate('/verify');
        }
      }
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f4f4f4' 
    }}>
      <div style={{ 
        padding: '30px', 
        maxWidth: '400px', 
        width: '100%',
        backgroundColor: 'white', 
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {isSignup ? '🚗 Driver Registration' : '🚗 Driver Login'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isSignup && (
            <>
              <input 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                style={inputStyle}
              />
              <input 
                placeholder="Phone Number" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                required 
                style={inputStyle}
              />
            </>
          )}
          <input 
            placeholder="Email Address" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={inputStyle}
          />
          <input 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={inputStyle}
          />
          
          <button type="submit" style={buttonStyle}>
              {isSignup ? 'Register & Verify' : 'Login to Dashboard'}
          </button>
        </form>

        <p 
            onClick={() => setIsSignup(!isSignup)} 
            style={{ color: 'blue', cursor: 'pointer', textAlign: 'center', marginTop: '15px' }}
        >
          {isSignup ? 'Already have an account? Login' : 'New Driver? Register here'}
        </p>
      </div>
    </div>
  );
};

// Simple styles objects to keep JSX clean
const inputStyle = {
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px'
};

const buttonStyle = {
    padding: '12px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

export default PartnerLogin;