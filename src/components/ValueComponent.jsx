import React from "react";
import criticalInfo from '../assets/Values/critical-info.png';
import keyData from '../assets/Values/key-data.png';
import saveTime from '../assets/Values/save-time.png';
import timeSavingAnalytics from '../assets/Values/time-saving-analytics.png';
import '../styles/GeneralStyles.css';
import '../styles/ValueComponent.css';

const ValueComponent = ({ index }) => {
    const indexedPictures = [saveTime, keyData, criticalInfo, timeSavingAnalytics];

    const contentMap = [
        {
            title: "We save you time",
            content: "We save you time; We provide the research that is often time consuming to allow our clients to focus on managing their investments, not finding them."
        },
        {
            title: "Visualization of Key Data",
            content: "MakCorp provides in depth data in a visual interface. Our clients aren't just limited to searching by a company or a code, but by project areas, directors and financial indicators."
        },
        {
            title: "Critical Information",
            content: "MakCorp uses its research team to compile the most critical data in researching resource stocks. Our goal is to connect our clients with the right data and tools to unleash their Investment potential."
        },
        {
            title: "Time Saving Analytics",
            content: "Dissect and query over 600 data points from projects, market data, directors, top 20, financials in seconds, not hours, days or weeks that it would take to do manually."
        }
    ];

    const Picture = () => (
        <div className="illustration-container">
            <img src={indexedPictures[index-1]} className="picture" alt={contentMap[index-1].title} />
        </div>
    );

    return (
        <div className="value-section">
            {index % 2 !== 0 ? <Picture /> : null}
            
            <div className="content-container">
                <div>Step <span className="step-indicator">{index}</span>
                </div>
                <h2>{contentMap[index-1].title}</h2>
                <p>{contentMap[index-1].content}</p>
            </div>
            
            {index % 2 === 0 ? <Picture /> : null}
        </div>
    );
}

export default ValueComponent;