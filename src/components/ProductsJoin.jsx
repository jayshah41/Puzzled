import React from 'react';
import '../styles/GeneralStyles.css';

const ProductsJoin = () => {
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;
  
  if (isLoggedIn) {
    return null;
  }
  
  return (
    <div style={{ margin: "75px" }}>
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="centre">Join The MakCorp Community</h1>
        <div className="centre">
          <button className="defulatButton">Start now</button>
        </div>
      </div>
    </div>
  );
};

export default ProductsJoin;