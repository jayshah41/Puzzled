import React from 'react';
import '../styles/ServicesCard.css';

const ServicesCard = ({ image, title, content }) => {

return (
    <div className="card" style={{ height: '275px' }}>
        <img src={image} style={{ width: '50px' }}></img>
        <h3 className="card-header">{title}</h3>
        <p className="card-content">{content}</p>
    </div>
);
};

export default ServicesCard