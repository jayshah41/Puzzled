import React from 'react'

const Card = ({ icon: Icon, title, content }) => {

return (
    <div className="rounded-lg flex flex-col items-start">
        <Icon className="text-4xl text-blue-600" />
        <h3 className="text-xl font-semibold mt-4">{title}</h3>
        <p className="text-gray-600 mt-2">{content}</p>
    </div>
);
};

export default Card