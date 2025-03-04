import React from 'react'
import './ServicesCard.css'

const ServicesCard = ({ icon: Icon, title, content }) => {

return (
    <div className="card">
        <Icon className="text-4xl text-blue-600" />
        <h3 className="card-header">{title}</h3>
        <p className="card-content">{content}</p>
    </div>
);
};

export default ServicesCard