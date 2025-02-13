import React from 'react'
import { FaDollarSign, FaChartLine, FaDatabase, FaFacebook, FaLinkedin, FaTwitter, FaPodcast } from "react-icons/fa";

const Services = () => {
  return (
    <div className="bg-gray-50 py-12 px-6 text-center">
      <h2 className="text-4xl font-bold text-gray-900">Services we provide</h2>
      <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
        Makcorp provides a wide range of services for opportunities related to the mining industry.
        Whether you are an investor or a business looking to expand your footprint within the industry,
        MakCorp has tools available to provide research and analytics on mining organisations listed on the ASX.
      </p>
      <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
        The MakCorp platform can help you become more successful whether you are a retail investor,
        a corporate investor, or a business owner. Let us help you find your next opportunity for growth.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        <h3>Commodity Pricing</h3>
        <p>See the prices for each commodity on a daily basis including potential value of JORCS.</p>
        <h3>Stock Performance</h3>
        <p>See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly.</p>
        <h3>Data Services</h3>
        <p>Contact us for other data services including project research and director research.</p>
      </div>

      <div className="mt-12 flex justify-center space-x-6 text-2xl text-blue-600">
        <FaFacebook className="cursor-pointer hover:text-blue-800" />
        <FaLinkedin className="cursor-pointer hover:text-blue-800" />
        <FaTwitter className="cursor-pointer hover:text-blue-800" />
        <FaPodcast className="cursor-pointer hover:text-blue-800" />
      </div>
    </div>
  );
};

export default Services