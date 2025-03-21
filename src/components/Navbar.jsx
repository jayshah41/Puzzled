import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useSaveContent from '../hooks/useSaveContent';
import Login from './Login';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import profileIcon from '../assets/profileIcon.png';
import '../styles/Navbar.css';

const Navbar = () => {
  const userTierLevel = parseInt(localStorage.getItem("user_tier_level"), 10) || 0;
  const isAdminUser = userTierLevel === 2;
  const hasGraphAccess = userTierLevel >= 1;
  const navigate = useNavigate();
  const saveContent = useSaveContent();

  const [isEditing, setIsEditing] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [graphLinks, setGraphLinks] = useState([]);
  const [showingLogin, setShowingLogin] = useState(false);
  const [showingSignup, setShowingSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showGraphsDropdown, setShowGraphsDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/editable-content/?component=Navbar')
      .then((response) => response.json())
      .then((data) => {
        const fetchedTabs = data
          .filter(item => item.section.startsWith('tab'))
          .map((item) => JSON.parse(item.text_value))
          .filter(tab => tab.accessLevel <= userTierLevel);
        const fetchedGraphLinks = data
          .filter(item => item.section.startsWith('graph'))
          .map((item) => JSON.parse(item.text_value))
          .filter(graph => graph.accessLevel <= userTierLevel);
        setTabs(fetchedTabs);
        setGraphLinks(fetchedGraphLinks);
      })
      .catch((error) => {
        console.error('Error fetching content:', error);
      });
  }, [userTierLevel]);

  const handleSave = () => {
    const tabContentData = tabs.map((tab, index) => ({
      component: 'Navbar',
      section: `tab${index}`,
      text_value: JSON.stringify(tab),
    }));

    const graphContentData = graphLinks.map((graph, index) => ({
      component: 'Navbar',
      section: `graph${index}`,
      text_value: JSON.stringify(graph),
    }));

    saveContent([...tabContentData, ...graphContentData]);
  };

  const toggleTabVisibility = (index) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, i) =>
        i === index ? { ...tab, showing: !tab.showing } : tab
      )
    );
  };

  const toggleGraphVisibility = (index) => {
    setGraphLinks((prevGraphLinks) =>
      prevGraphLinks.map((graph, i) =>
        i === index ? { ...graph, showing: !graph.showing } : graph
      )
    );
  };

  const links = tabs.map((tab, index) => (
    isEditing ? (
      <div key={index} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <input
          type="text"
          value={tab.text}
          onChange={(e) =>
            setTabs((prevTabs) =>
              prevTabs.map((t, i) =>
                i === index ? { ...t, text: e.target.value } : t
              )
            )
          }
          style={{ width: '7vw' }}
        />
        <button onClick={() => toggleTabVisibility(index)}>
          {tab.showing ? '-' : '+'}
        </button>
      </div>
    ) : (
      tab.showing && (
        <div key={index}>
          <Link to={tab.link}>{tab.text}</Link>
        </div>
      )
    )
  ));

  const graphLinksUI = graphLinks.map((graph, index) => (
    isEditing ? (
      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <input
          type="text"
          value={graph.text}
          onChange={(e) =>
            setGraphLinks((prevGraphLinks) =>
              prevGraphLinks.map((g, i) =>
                i === index ? { ...g, text: e.target.value } : g
              )
            )
          }
          style={{ marginRight: '8px' }}
        />
        <button
          onClick={() => toggleGraphVisibility(index)}
          style={{ marginLeft: '8px' }}
        >
          {graph.showing ? '-' : '+'}
        </button>
      </div>
    ) : (
      graph.showing && (
        <Link key={index} to={graph.link}>
          {graph.text}
        </Link>
      )
    )
  ));

  const areAnyGraphsVisible = hasGraphAccess && graphLinks.some(graph => graph.showing);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowingLogin(false);
    console.log('Login successful. isLoggedIn:', true);
    navigate('/account');
  };

  const contentIsValid = (tabs, graphLinks) => {
    for (const tab of tabs) {
      if (!tab.text.trim() || !tab.link.trim()) {
        return false;
      }
    }
    for (const graph of graphLinks) {
      if (!graph.text.trim() || !graph.link.trim()) {
        return false;
      }
    }
    return true;
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
              style={{ padding: '10px' }}
            />
          </Link>
        </div>
        {isAdminUser ? (
          <button
            onClick={() => {
              if (isEditing) {
                if (contentIsValid(tabs, graphLinks)) {
                  handleSave();
                  setIsEditing(false);
                } else {
                  alert('Please ensure all fields are filled out before saving.');
                }
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'Stop Editing' : 'Edit'}
          </button>
        ) : null}
        {links}
        {(isEditing || (isLoggedIn && areAnyGraphsVisible)) && (
          <div className="dropdown">
            <button
              className="dropbtn"
              onMouseEnter={() => setShowGraphsDropdown(true)}>
              Graphs
            </button>
            {showGraphsDropdown && (
              <div className="dropdown-content">
                {graphLinksUI}
              </div>
            )}
          </div>
        )}

        <div>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setShowingLogin(true);
                  setShowingSignup(false);
                }}>
                Log In
              </button>
              <button
                onClick={() => {
                  setShowingSignup(true);
                  setShowingLogin(true);
                }}>
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
          onLoginSuccess={handleLoginSuccess} />
      )}
    </nav>
  );
};

export default Navbar;