import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthRedirect from '../hooks/useAuthRedirect';
import '../styles/Modal.css'; 
import { motion } from 'framer-motion';



const AccountManager = () => {
  useAuthRedirect();
  
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [commodities, setCommodities] = useState([]);
  const [tierLevel, setTierLevel] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const commodityOptions = ["Aluminum", "Coal", "Cobalt", "Copper", "Gold", "Graphite", 
        "Halloysite", "Iron Ore", "Lithium", "Magnesium", "Manganese",
        "Mineral Sands", "Molybdenum", "Nickel", "Oil & Gas", "Palladium",
        "Platinum", "Potash", "Rare Earths", "Scandium", "Tantalum", "Tin",
        "Titanium", "Tungsten", "Uranium", "Vanadium", "Zinc"];


  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await fetch('/api/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEmail(data.email);
          setPhone(data.phone_number);
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setCommodities(data.commodities);
          setTierLevel(data.tier_level);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, []);

  const debugFetch = async (url, options) => {
    console.log(`Sending request to ${url}`, options);
    try {
      const response = await fetch(url, options);
      console.log(`Response from ${url}:`, response.status);
      return response;
    } catch (error) {
      console.error(`Error with request to ${url}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('No access token found. Please log in again.');
        return;
      }
      
      try {
        const response = await debugFetch('/api/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setEmail(data.email || '');
          setPhone(data.phone_number || '');
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setCommodities(data.commodities || []);
          setTierLevel(data.tier_level || '');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch user data:', response.status, errorData);
          setError('Failed to fetch user data. Please try again.');
          
          if (response.status === 401) {
            setStatusMessage({ type: 'error', text: 'Session expired. Please log in again.' });
            setTimeout(handleLogout, 2000);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('An error occurred. Please try again.');
      }
    };
  
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
    window.dispatchEvent(new Event('storage'));
  };

  const handleCommodityChange = (index, value) => {
    const updatedCommodities = [...commodities];
    updatedCommodities[index] = value;
    setCommodities(updatedCommodities);
  };

  const handleUpdate = async (endpoint, body, successMessage) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'No access token found. Please log in again.' });
      setTimeout(handleLogout, 2000);
      return;
    }
    
    setStatusMessage({ type: '', text: '' }); // Clear previous messages
    
    try {
      const response = await debugFetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        setStatusMessage({ type: 'success', text: successMessage });
        
        // Clear password fields after successful update
        if (body.old_password) {
          setOldPassword('');
          setNewPassword('');
        }
      } else if (response.status === 401) {
        setStatusMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        setTimeout(handleLogout, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage({ 
          type: 'error', 
          text: errorData.message || 'Failed to update. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error updating:', error);
      setStatusMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'No access token found. Please log in again.' });
      setTimeout(handleLogout, 2000);
      return;
    }
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await debugFetch('/api/delete-account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      
      if (response.ok) {
        alert('Account deleted successfully!');
        handleLogout();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage({ 
          type: 'error', 
          text: errorData.message || 'Failed to delete account. Please check your password and try again.' 
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setStatusMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };

  const addCommodity = () => {
    if (commodities.length < 5) {
      setCommodities([...commodities, '']);
    } else {
      setStatusMessage({ type: 'error', text: 'Maximum 5 commodities allowed' });
    }
  };

  const removeCommodity = (index) => {
    const updatedCommodities = [...commodities];
    updatedCommodities.splice(index, 1);
    setCommodities(updatedCommodities);
  };

  return (
    <motion.div
      className="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ alignItems: 'flex-start', paddingTop: '100px' }} // Add this line

    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h1>Account Manager</h1>
        {error && <p className="error-message">{error}</p>}
        
        {statusMessage.text && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="form-section">
          <h2>Change Email</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/update-profile/', { email }, 'Email updated successfully!');
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="New Email"
              className="auth-input"
              required
            />
            <button type="submit" className="auth-button">Update Email</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Phone Number</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/update-profile/', { phone_number: phone }, 'Phone number updated successfully!');
          }}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="New Phone Number"
              className="auth-input"
              required
            />
            <button type="submit" className="auth-button">Update Phone</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Password</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/update-profile/', { old_password: oldPassword, new_password: newPassword }, 'Password updated successfully!');
          }}>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old Password"
              className="auth-input"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="auth-input"
              required
            />
            <button type="submit" className="auth-button">Update Password</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Name</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/update-profile/', { first_name: firstName, last_name: lastName }, 'Name updated successfully!');
          }}>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="auth-input"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="auth-input"
              required
            />
            <button type="submit" className="auth-button">Update Name</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Commodities</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/update-profile/', { commodities }, 'Commodities updated successfully!');
          }}>
            {commodities.map((commodity, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                <select
                  value={commodity}
                  onChange={(e) => handleCommodityChange(index, e.target.value)}
                  className="auth-input"
                  style={{ marginBottom: 0, marginRight: '10px', flex: 1 }}
                  required
                >
                  <option value="" disabled>Select a commodity</option>
                  {commodityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => removeCommodity(index)}
                  style={{ padding: '0 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                  ✕
                </button>
              </div>
            ))}
            {commodities.length < 3 && (
              <button 
                type="button" 
                onClick={addCommodity}
                className="auth-button"
                style={{ backgroundColor: '#28a745', marginBottom: '10px' }}
              >
                Add Commodity
              </button>
            )}
            <button type="submit" className="auth-button">Update Commodities</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Delete Account</h2>
          <p>This action cannot be undone. Please enter your password to confirm.</p>
          <form onSubmit={handleDeleteAccount}>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter Password"
              className="auth-input"
              required
            />
            <button type="submit" className="auth-button delete-button">Delete Account</button>
          </form>
        </div>

        <button className="auth-button logout-button" onClick={handleLogout}>Logout</button>
      </motion.div>
    </motion.div>
  );
};

export default AccountManager;