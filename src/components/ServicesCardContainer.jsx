import React from 'react';
import ServicesCard from './ServicesCard';
import './GeneralStyles.css';
import moneyBag from '../assets/ServicesCards/money-bag.png';
import graphUp from '../assets/ServicesCards/graph-up.png';
import newspaper from '../assets/ServicesCards/newspaper.png';

const ServicesCardContainer = () => {
  return (
    <div className="three-card-container">
        <ServicesCard image={moneyBag} title="Commodity Pricing" content="See the prices for each commodity on a daily basis including potential value of JORCS." />
        <ServicesCard image={graphUp} title="Stock Performance" content="See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly." />
        <ServicesCard image={newspaper} title="Data Services" content="Contact us for other data services including project research and director research." />
    </div>
  )
}

export default ServicesCardContainer;