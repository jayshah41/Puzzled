import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountManager = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div>
      <h1>Account Manager</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AccountManager;