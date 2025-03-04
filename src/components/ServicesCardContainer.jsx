import React from 'react';
import { FaDollarSign, FaChartLine, FaDatabase } from 'react-icons/fa';
import ServicesCard from './ServicesCard';
import './GeneralStyles.css';

const ServicesCardContainer = () => {
  return (
    <div className="three-card-container">
        <ServicesCard icon={FaDollarSign} title="Commodity Pricing" content="See the prices for each commodity on a daily basis including potential value of JORCS."/>
        <ServicesCard icon={FaChartLine} title="Stock Performance" content="See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly." />
        <ServicesCard icon={FaDatabase} title="Data Services" content="Contact us for other data services including project research and director research." />
    </div>
  )
}

export default ServicesCardContainer