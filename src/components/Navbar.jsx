import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSaveContent from '../hooks/useSaveContent';
import LoginHandler from './LoginHandler';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import profileIcon from '../assets/profileIcon.png';
import '../styles/GeneralStyles.css';
import '../styles/GeneralStyles.css';
import '../styles/Navbar.css';

const Navbar = () => {
  const userTierLevel = parseInt(localStorage.getItem("user_tier_level"), 10) || 0;
  const isAdminUser = userTierLevel === 2;
  const hasGraphAccess = userTierLevel >= 1;
  const saveContent = useSaveContent();

  const [isEditing, setIsEditing] = useState(false);
  const [tabs, setTabs] = useState([
    { text: "Home", link: "/", showing: true, accessLevel: -1 },
    { text: "Pricing", link: "/pricing", showing: true, accessLevel: -1 },
    { text: "Products", link: "/products", showing: true, accessLevel: -1 },
    { text: "Contact Us", link: "/contact-us", showing: true, accessLevel: -1 },
    { text: "News", link: "/news", showing: false, accessLevel: 0 },
    { text: "Socials", link: "/social-media", showing: false, accessLevel: 0 }
  ]);
  const [graphLinks, setGraphLinks] = useState([
    { text: "Company Details", link: "/graphs/company-details", showing: true, accessLevel: 1 },
    { text: "Market Data", link: "/graphs/market-data", showing: true, accessLevel: 1 },
    { text: "Market Trends", link: "/graphs/market-trends", showing: true, accessLevel: 1 },
    { text: "Directors", link: "/graphs/directors", showing: true, accessLevel: 1 },
    { text: "Shareholders", link: "/graphs/shareholders", showing: true, accessLevel: 1 },
    { text: "Capital Raises", link: "/graphs/capital-raises", showing: true, accessLevel: 1 },
    { text: "Projects", link: "/graphs/projects", showing: true, accessLevel: 1 },
    { text: "Financials", link: "/graphs/financials", showing: true, accessLevel: 1 }
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [graphsTitle, setGraphsTitle] = useState("Dashboards");
  const [showGraphsDropdown, setShowGraphsDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/proxy/editable-content/?component=Navbar')
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
        
        const graphsTitleItem = data.find(item => item.section === 'dropdownHeading');
        if (graphsTitleItem) {
          const graphsData = JSON.parse(graphsTitleItem.text_value);
          setGraphsTitle(graphsData.text);
        }

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

    const graphsTitleData = {
      component: 'Navbar',
      section: 'dropdownHeading',
      text_value: JSON.stringify({
        text: graphsTitle,
        link: "",
        showing: true,
        accessLevel: 1
      }),
    };

    saveContent([...tabContentData, ...graphContentData, graphsTitleData]);
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

  const contentIsValid = (tabs, graphLinks, graphsTitle) => {
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
    if (!graphsTitle.trim()) {
      return false;
    }
    
    return true;
  };

  return (
    <nav className="navbar sticky">
      <div className="navbar-container">
        <div className="centre">
          <Link to="/">
            <img
              src={makcorpLogoWithText}
              alt="MakCorp Logo"
              height="80px"
              style={{ padding: '10px' }}
            />
          </Link>
        
        {isAdminUser ? (
          <button className="edit-button"
          style={{ marginLeft: "20px" }}
            onClick={() => {
              if (isEditing) {
                if (contentIsValid(tabs, graphLinks, graphsTitle)) {
                  handleSave();
                  setIsEditing(false);
                  window.location.reload();
                } else {
                  alert('Please ensure all fields are filled out before saving.');
                }
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'Save Changes' : 'Edit'}
          </button>
        ) : null}
        </div>
        {links}
        {(isEditing || (isLoggedIn && areAnyGraphsVisible)) && (
          <div className="dropdown"
            onMouseEnter={() => setShowGraphsDropdown(true)}
            onMouseLeave={() => setShowGraphsDropdown(false)}>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={graphsTitle}
                  onChange={(e) => setGraphsTitle(e.target.value)}
                  style={{ marginRight: '8px', width: '100px' }}
                />
              </div>
            ) : (
              <button className="dropbtn navbar-button">{graphsTitle}</button>
            )}
            {showGraphsDropdown && (
              <div className="dropdown-content">
                {graphLinksUI}
              </div>
            )}
          </div>
        )}

        <LoginHandler>
          {({ handleOpenLogin, handleOpenSignup }) => (
            <div>
              {!isLoggedIn ?
                <>
                  <button className="navbar-button" onClick={handleOpenLogin}>Log In</button>
                  <button className="navbar-button" onClick={handleOpenSignup}>Sign Up</button>
                </>
              :
                <Link to="/account">
                  <div className="profile-icon">
                    <img src={profileIcon} alt="Profile" />
                  </div>
                </Link>
              }
            </div>
          )}
        </LoginHandler>
      </div>
    </nav>
  );
};

export default Navbar;