import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Verification = () => {
  const [license, setLicense] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'license') setLicense(file);
    if (type === 'selfie') setSelfie(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!license || !selfie) return alert("Please upload both documents");

    setUploading(true);
    
    // We must use FormData to send files
    const formData = new FormData();
    formData.append('license', license);
    formData.append('selfie', selfie);

    try {
      const res = await API.post('/partners/upload-docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        alert("Documents Uploaded! You are now Verified.");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert("Upload Failed. Check Backend Console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>🪪 Verification Required</h2>
      <p>To accept rides, please upload your documents.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
        
        {/* License */}
        <div style={boxStyle}>
          <label style={{ fontWeight: 'bold' }}>1. Driving License</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'license')} style={{ marginTop: '10px' }} />
        </div>

        {/* Selfie */}
        <div style={boxStyle}>
          <label style={{ fontWeight: 'bold' }}>2. Your Selfie</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} style={{ marginTop: '10px' }} />
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          style={{ 
            padding: '15px', background: uploading ? '#ccc' : 'black', color: 'white', 
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' 
          }}
        >
          {uploading ? "Uploading to Cloud..." : "Submit Documents"}
        </button>
      </form>
    </div>
  );
};

const boxStyle = {
  border: '1px solid #ddd',
  padding: '15px',
  borderRadius: '8px',
  background: '#f9f9f9'
};

export default Verification;