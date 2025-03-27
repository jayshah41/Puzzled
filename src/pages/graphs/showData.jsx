import React, { useEffect, useState } from "react";

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("/api/proxy/services/")
      .then(response => response.json())
      .then(data => setServices(data))
      .catch(error => console.error("Error fetching services:", error));
  }, []);

  return (
    <div>
      <h2>Our Services</h2>
      <ul>
        {services.length > 0 ? (
          services.map((service, index) => (
            <li key={index}>{service.name}</li>
          ))
        ) : (
          <p>Loading services...</p>
        )}
      </ul>
    </div>
  );
};

export default Services;
