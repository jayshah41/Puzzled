import React, { useState, useEffect } from 'react';
import '../styles/ValueComponent.css';
import ValueComponent from './ValueComponent';

const Values = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  
  const [isEditing, setIsEditing] = useState(false);
  const [heading, setHeading] = useState("MakCorp's Value to Clients");
  const [contentMap, setContentMap] = useState([]);

  useEffect(() => {
    fetch('/api/editable-content/?component=Values')
      .then(response => response.json())
      .then(data => {
        const updatedContentMap = [
          {
            title: data.find(content => content.section === 'title1')?.text_value || "We save you time",
            content: data.find(content => content.section === 'content1')?.text_value || "We save you time; We provide the research that is often time consuming to allow our clients to focus on managing their investments, not finding them."
          },
          {
            title: data.find(content => content.section === 'title2')?.text_value || "Visualization of Key Data",
            content: data.find(content => content.section === 'content2')?.text_value || "MakCorp provides in depth data in a visual interface. Our clients aren't just limited to searching by a company or a code, but by project areas, directors and financial indicators."
          },
          {
            title: data.find(content => content.section === 'title3')?.text_value || "Critical Information",
            content: data.find(content => content.section === 'content3')?.text_value || "MakCorp uses its research team to compile the most critical data in researching resource stocks. Our goal is to connect our clients with the right data and tools to unleash their Investment potential."
          },
          {
            title: data.find(content => content.section === 'title4')?.text_value || "Time Saving Analytics",
            content: data.find(content => content.section === 'content4')?.text_value || "Dissect and query over 600 data points from projects, market data, directors, top 20, financials in seconds, not hours, days or weeks that it would take to do manually."
          }
        ];
        setHeading(data.find(content => content.section === 'heading')?.text_value || "MakCorp's Value to Clients");
        setContentMap(updatedContentMap);
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const saveContent = () => {
    fetch('/api/editable-content/update/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component: 'Values',
        section: 'heading',
        text_value: heading
      }),
    })
      .then(response => response.json())
      .then(data => {
        // console.log('Heading saved successfully:', data);
      })
      .catch(error => {
        console.error('There was an error saving the heading', error);
      });
  };

  return (
    <div className="values-container">
      {isAdminUser ?
        <button onClick={() => {
          if (isEditing) {
            saveContent();
          }
          setIsEditing(!isEditing);
        }}
        style={{ marginBottom: '1rem' }}>
          {isEditing ? 'Stop Editing' : 'Edit'}</button>
      : null}
      <div className="values-header">
        {isEditing ? (
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="auth-input"
          />
        ) : (
          <h1>{heading}</h1>
        )}
      </div>
      
      <div className="values-list">
        {contentMap.map((content, index) => (
          <ValueComponent key={index} index={index + 1} title={content.title} content={content.content} isEditing={isEditing} setContentMap={setContentMap} />
        ))}
      </div>
    </div>
  );
}

export default Values;