import React from "react";
import LoginHandler from "./LoginHandler";
import "../styles/GeneralStyles.css";

const ProductsJoin = () => {
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  if (isLoggedIn) {
    return null;
  }

  return (
    <LoginHandler>
      {({ handleOpenLogin }) => (
        <div style={{ margin: "75px" }}>
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="centre">Join The MakCorp Community</h1>
            <div className="centre">
              <button className="defulatButton" onClick={handleOpenLogin}>
                Start now
              </button>
            </div>
          </div>
        </div>
      )}
    </LoginHandler>
  );
};

export default ProductsJoin;