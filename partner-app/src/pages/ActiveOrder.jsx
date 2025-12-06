import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import API from '../api';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { io } from 'socket.io-client'; // Import Socket

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// 🚗 Custom Car Icon (Optional)
const CarIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/741/741407.png', // Simple Car Icon
  iconSize: [40, 40],
});

const ActiveOrder = () => {
  const [order, setOrder] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [driverPos, setDriverPos] = useState(null); // Current simulated position
  const [loading, setLoading] = useState(true);
  
  // Simulation Refs
  const socketRef = useRef();
  const simulationInterval = useRef();
  const stepIndex = useRef(0); // Which coordinate are we at?

  useEffect(() => {
    // 1. Connect Socket
    socketRef.current = io('http://localhost:5000');
    
    fetchActiveOrder();

    return () => {
      socketRef.current.disconnect();
      clearInterval(simulationInterval.current);
    };
  }, []);

  const fetchActiveOrder = async () => {
    try {
      const res = await API.get('/orders/my-active');
      setOrder(res.data);
      if (res.data) {
        // Set initial driver pos to pickup
        setDriverPos([res.data.pickupLocation.lat, res.data.pickupLocation.lng]);
        getRoute(res.data.pickupLocation, res.data.dropLocation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoute = async (pickup, drop) => {
    if (!pickup || !drop) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
      const res = await axios.get(url);
      if (res.data.routes.length > 0) {
        const coordinates = res.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoords(coordinates);
        
        // If status is 'in_transit', start moving immediately
        if(order?.status === 'in_transit') {
            startSimulation(coordinates);
        }
      }
    } catch (error) {
      console.error("Route Error", error);
    }
  };

  // 🚀 THE SIMULATION LOGIC
  const startSimulation = (path) => {
    if (simulationInterval.current) clearInterval(simulationInterval.current);

    simulationInterval.current = setInterval(() => {
      // Move 1 step forward in the array
      stepIndex.current = stepIndex.current + 1;

      // Check if reached end
      if (stepIndex.current >= path.length) {
        clearInterval(simulationInterval.current);
        return;
      }

      const newPos = path[stepIndex.current];
      setDriverPos(newPos); // Update Local UI

      // Emit to Server (So Customer sees it too!)
      if(order && socketRef.current) {
        socketRef.current.emit('update_location', {
            orderId: order._id,
            partnerId: order.partner,
            lat: newPos[0],
            lng: newPos[1]
        });
      }
    }, 1000); // Move every 1 second
  };

  const updateStatus = async (newStatus) => {
    try {
      await API.put('/orders/update-status', { orderId: order._id, status: newStatus });
      setOrder({ ...order, status: newStatus }); 
      
      if(newStatus === 'in_transit') {
        alert("Driving Started... Simulation Active! 🚗");
        startSimulation(routeCoords);
      }
      
      if(newStatus === 'delivered') {
        alert("🎉 Delivery Completed! Payment Added.");
        clearInterval(simulationInterval.current);
        window.location.href = '/dashboard'; 
      }
    } catch (err) {
      alert("Status update failed");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>No Job</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Map Area */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[order.pickupLocation.lat, order.pickupLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <Marker position={[order.pickupLocation.lat, order.pickupLocation.lng]}>
            <Popup>Pickup</Popup>
          </Marker>

          <Marker position={[order.dropLocation.lat, order.dropLocation.lng]}>
            <Popup>Drop</Popup>
          </Marker>

          {/* DRIVER MARKER (MOVING) */}
          {driverPos && (
             <Marker position={driverPos} icon={CarIcon}>
                <Popup>You (Driving)</Popup>
             </Marker>
          )}

          {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" weight={5} />}
        </MapContainer>
      </div>

      {/* Control Panel */}
      <div style={{ padding: '20px', background: 'white', borderTop: '2px solid #eee' }}>
        <h3>Status: {order.status.replace('_', ' ').toUpperCase()}</h3>
        
        {order.status === 'accepted' && (
           <button onClick={() => updateStatus('picked_up')} style={btnStyle}>📦 Confirm Pickup</button>
        )}
        
        {order.status === 'picked_up' && (
           <button onClick={() => updateStatus('in_transit')} style={{...btnStyle, background: '#2196F3'}}>🚚 Start Journey (Simulate)</button>
        )}

        {order.status === 'in_transit' && (
           <button onClick={() => updateStatus('delivered')} style={{...btnStyle, background: 'green'}}>✅ Complete Delivery</button>
        )}
      </div>
    </div>
  );
};

const btnStyle = { width: '100%', padding: '15px', fontSize: '18px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };

export default ActiveOrder;