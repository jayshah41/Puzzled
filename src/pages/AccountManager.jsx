import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthRedirect from '../hooks/useAuthRedirect';
import useAuthToken from '../hooks/useAuthToken';
import InputField from '../components/InputField';
import CommodityManager from '../components/CommodityManager';
import StatusMessage from '../components/StatusMessage';
import '../styles/GeneralStyles.css';
import '../styles/AccountManager.css';
import '../styles/Modal.css';

const AccountManager = () => {
  const userAuthLevel = localStorage.getItem("user_tier_level");
  useAuthRedirect();
  const { getAccessToken, authError } = useAuthToken();

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
  const [selectedTier, setSelectedTier] = useState(() => {
    const userLevel = parseInt(userAuthLevel, 10);
    if (userLevel === 2) return "1";
    if (userLevel === 1) return "0";
    return "";
  });

  const commodityOptions = ["Aluminum", "Coal", "Cobalt", "Copper", "Gold", "Graphite", 
    "Halloysite", "Iron Ore", "Lithium", "Magnesium", "Manganese",
    "Mineral Sands", "Molybdenum", "Nickel", "Oil & Gas", "Palladium",
    "Platinum", "Potash", "Rare Earths", "Scandium", "Tantalum", "Tin",
    "Titanium", "Tungsten", "Uranium", "Vanadium", "Zinc"];
  
  const tierDescriptionMap = ['Basic Plan', 'Premium Plan', 'Admin'];

  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await fetch('/api/proxy/profile/', {
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
    localStorage.setItem("user_tier_level", "-1");
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdate = async (endpoint, body, successMessage) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'No access token found. Please log in again.' });
      setTimeout(handleLogout, 2000);
      return;
    }

    setStatusMessage({ type: '', text: '' });

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', text: successMessage });

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

  const handleTierDowngrade = async (newTier) => {
  
    const accessToken = localStorage.getItem('accessToken');
    console.log('Access Token:', accessToken);
    console.log('Selected Tier:', newTier);
  
    try {
      const response = await fetch('/api/proxy/update-tier/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tier_level: parseInt(newTier, 10) }),
      });
  
      if (response.ok) {
        setStatusMessage({ type: 'success', text: 'Tier level downgraded successfully!' });
        localStorage.setItem("user_tier_level", String(newTier));
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage({ type: 'error', text: errorData.message || 'Failed to downgrade tier.' });
      }
    } catch (error) {
      console.error('Error downgrading tier:', error);
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

    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/proxy/delete-account/', {
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

  return (
    <div className="standard-padding">
      <h1 style={{ textAlign: "center", marginBottom: "75px" }}>Welcome {firstName}!</h1>
      {error && <p className="error-message">{error}</p>}
      <StatusMessage type={statusMessage.type} text={statusMessage.text} />
      <h2 className="centre" style={{ marginBottom: "75px" }}>
        Tier Level {parseInt(userAuthLevel, 10)+1}: {tierDescriptionMap[parseInt(userAuthLevel, 10)]}
      </h2>
      <div className="container">
        <div className="form-section">
          <h2>Change Email</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/proxy/update-profile/', { email }, 'Email updated successfully!');
          }}>
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="New Email"
            />
            <button type="submit" className="auth-button">Update Email</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Phone Number</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/proxy/update-profile/', { phone_number: phone }, 'Phone number updated successfully!');
          }}>
            <InputField
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="New Phone Number"
            />
            <button type="submit" className="auth-button">Update Phone</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Password</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/proxy/update-profile/', { old_password: oldPassword, new_password: newPassword }, 'Password updated successfully!');
          }}>
            <InputField
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old Password"
            />
            <InputField
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
            />
            <button type="submit" className="auth-button">Update Password</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Name</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/proxy/update-profile/', { first_name: firstName, last_name: lastName }, 'Name updated successfully!');
          }}>
            <InputField
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
            <InputField
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
            <button type="submit" className="auth-button">Update Name</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Change Commodities</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate('/api/proxy/update-profile/', { commodities }, 'Commodities updated successfully!');
          }}>
            <CommodityManager
              commodities={commodities}
              setCommodities={setCommodities}
              commodityOptions={commodityOptions}
            />
            <button type="submit" className="auth-button">Update Commodities</button>
          </form>
        </div>

        {parseInt(userAuthLevel, 10) > 0 && (
          <div className="form-section">
            <h2>Downgrade Tier Level</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleTierDowngrade(selectedTier);
            }}>
              <label htmlFor="tier-select">Select New Tier Level:</label>
              <select
                id="tier-select"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
              >
                {parseInt(userAuthLevel, 10) === 2 && (
                  <option value="1">Tier Level 2 - Premium Plan</option>
                )}
                <option value="0">Tier Level 1 - Basic Plan</option>
              </select>
              <button type="submit" className="auth-button">Downgrade Tier</button>
            </form>
          </div>
        )}

        <div className="form-section">
          <h2>Delete Account</h2>
          <p>This action cannot be undone. Please enter your password to confirm.</p>
          <form onSubmit={handleDeleteAccount}>
            <InputField
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter Password"
            />
            <button type="submit" className="auth-button delete-button">Delete Account</button>
          </form>
        </div>
      </div>

      <button className="auth-button logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AccountManager;