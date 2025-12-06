import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Import useNavigate
import API from '../api';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // <--- Initialize Hook

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders/pending');
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check if I already have an active job
    const checkActive = async () => {
        try {
            const res = await API.get('/orders/my-active');
            if(res.data) {
                navigate('/active'); // <--- Smooth Redirect
            }
        } catch(err) {
            console.log("No active orders");
        }
    };
    checkActive();

    // 2. Fetch Initial Orders
    fetchOrders();

    // 3. Poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const acceptOrder = async (orderId) => {
    try {
      await API.put('/orders/accept', { orderId });
      alert("Order Accepted! Navigate to Pickup.");
      navigate('/active'); // <--- Smooth Redirect (No Page Reload)
    } catch (error) {
      alert("Failed to accept. Someone else may have taken it.");
      fetchOrders(); // Refresh list immediately
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>🛺 Partner App</h1>
        <button onClick={fetchOrders} style={{ padding: '8px 12px', cursor: 'pointer' }}>
            🔄 Refresh
        </button>
      </div>

      <h3 style={{ color: '#555' }}>New Requests ({orders.length})</h3>

      {/* Loading State */}
      {loading && orders.length === 0 && <p>Loading orders...</p>}

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {orders.length === 0 && !loading ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '10px' }}>
                <p>No orders nearby...</p>
                <p style={{ fontSize: '12px', color: '#888' }}>Wait for a customer to book.</p>
            </div>
        ) : (
            orders.map(order => (
            <div key={order._id} style={cardStyle}>
                
                {/* Pickup Info */}
                <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>🟢 PICKUP</span>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {order.pickupLocation?.address ? order.pickupLocation.address.substring(0, 40) + "..." : "Unknown"}
                    </div>
                </div>

                {/* Drop Info */}
                <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontSize: '12px', color: 'red', fontWeight: 'bold' }}>🔴 DROP</span>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                        {order.dropLocation?.address ? order.dropLocation.address.substring(0, 40) + "..." : "Unknown"}
                    </div>
                </div>

                {/* Price & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
                        ₹{order.amount}
                    </span>
                    
                    <button 
                        onClick={() => acceptOrder(order._id)}
                        style={acceptBtnStyle}
                    >
                    Accept Ride
                    </button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

// Styles
const cardStyle = {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s'
};

const acceptBtnStyle = {
    background: 'black',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
};

export default Dashboard;