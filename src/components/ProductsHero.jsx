import React from 'react';
import productsHeaderImage from '../assets/products-header-image.png';
import '../styles/GeneralStyles.css';

const ProductsHero = () => {
  return (
    <div className="two-card-container standard-padding">
        <div>
        <h1>MakCorp is more than a platform</h1>
        <p>MakCorp offers unparalleled access to immediate and essential information for the resources sector. Our offering provides our clients with the tools they need to see data, the way they want to.
          MakCorp prides itself on using interactive technology to help visualize key metrics to improve investment decisions.</p>
        <button className="defulatButton">Start now</button>
        </div>
        <img src={productsHeaderImage} style={{ width: '45vw'}}></img>
    </div>
  )
}

export default ProductsHero