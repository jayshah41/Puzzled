import React from 'react';
import pricingHeaderImage from '../assets/pricing-header-image.png';
import '../styles/GeneralStyles.css';

const PricingHero = () => {
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;
  return (
    <div className="two-card-container standard-padding">
        <div>
        <h1>MakCorp Platform through Affordable Subscriptions</h1>
        <p>The MakCorp platform provides our users with access to 6 key data modules with over 600 data points to provide our clients with the ability to make better informed investment decisions.
        As an example, using projects data, users can seamlessly filter based upon key indicators like commodity type, geographic location or project stage to identify potential investment or client oppotunities.</p>
        {!isLoggedIn ?
        <button className="defulatButton">Start now</button>
        : null}
        </div>
        <img src={pricingHeaderImage} style={{ width: '45vw', paddingLeft: "35px" }}></img>
    </div>
  )
}

export default PricingHero