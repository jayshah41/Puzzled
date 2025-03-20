import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import profileIcon from '../assets/profileIcon.png';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';
import Login from './Login';

const Navbar = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);

  const [content, setContent] = useState([
    { text: "Home", link: "/" },
    { text: "Pricing", link: "/pricing" },
    { text: "Products", link: "/products" },
    { text: "Contact Us", link: "/contact-us" }
  ]);

  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const links = content.map((e, index) => (
    <div key={index} className="link-item">
      <Link to={e.link}>{e.text}</Link>
      {isEditing && (
        <div>
          <button onClick={() => handleRemoveLink(index)} className="remove-link-btn">
            Remove
          </button>
        </div>
      )}
    </div>
  ));

  const [showingLogin, setShowingLogin] = useState(false);
  const [showingSignup, setShowingSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showGraphsDropdown, setShowGraphsDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowingLogin(false);
    console.log("Login successful. isLoggedIn:", true);
    navigate("/account");
  };

  const handleAddLink = () => {
    if (newLinkText && newLinkUrl) {
      setContent([...content, { text: newLinkText, link: newLinkUrl }]);
      setNewLinkText("");
      setNewLinkUrl("");
      setShowAddLinkModal(false);
    }
  };

  const handleRemoveLink = (index) => {
    setContent(content.filter((_, i) => i !== index));
  };

  const openAddLinkModal = () => {
    setShowAddLinkModal(true);
  };

  const closeAddLinkModal = () => {
    setShowAddLinkModal(false);
    setNewLinkText("");
    setNewLinkUrl("");
  };

  return (
    <nav className="navbar sticky">
      <div className="navbar-container">
        <div className="flex items-center">
          <Link to="/">
            <img
              src={makcorpLogoWithText}
              alt="MakCorp Logo"
              height="80px"
              style={{ padding: "10px" }}
            />
          </Link>
        </div>
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Stop Editing" : "Edit"}
        </button>
        {links}
        {isEditing && (
          <button onClick={openAddLinkModal} className="add-link-btn">
            Add Link
          </button>
        )}
        {isLoggedIn ? (
          <div className="dropdown">
            <button
              className="dropbtn"
              onMouseEnter={() => setShowGraphsDropdown(true)}
            >
              Graphs
            </button>
            {showGraphsDropdown && (
              <div className="dropdown-content">
                <Link to="/graphs/company-details">Company Details</Link>
                <Link to="/graphs/market-data">Market Data</Link>
                <Link to="/graphs/market-trends">Market Trends</Link>
                <Link to="/graphs/directors">Directors</Link>
                <Link to="/graphs/shareholders">Shareholders</Link>
                <Link to="/graphs/capital-raises">Capital Raises</Link>
                <Link to="/graphs/projects">Projects</Link>
                <Link to="/graphs/financials">Financials</Link>
              </div>
            )}
          </div>
        ) : null}

        <div>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setShowingLogin(true);
                  setShowingSignup(false);
                }}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setShowingSignup(true);
                  setShowingLogin(true);
                }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <Link to="/account">
              <div className="profile-icon">
                <img src={profileIcon} alt="Profile" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {showingLogin && (
        <Login
          onClose={() => setShowingLogin(false)}
          loginButton={!showingSignup}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showAddLinkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Navigation Link</h3>
            <div className="form-group">
              <label htmlFor="linkText">Link Text:</label>
              <input
                type="text"
                id="linkText"
                placeholder="e.g. About Us"
                value={newLinkText}
                onChange={(e) => setNewLinkText(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="linkUrl">Link URL:</label>
              <input
                type="text"
                id="linkUrl"
                placeholder="e.g. /about-us"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={handleAddLink} className="add-btn">
                Add
              </button>
              <button onClick={closeAddLinkModal} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;