import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

const LoginHandler = ({ children, isPricing=false }) => {
  const navigate = useNavigate();

  const [showingLogin, setShowingLogin] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleOpenLogin = () => {
    setIsLoginMode(true);
    setShowingLogin(true);
  };

  const handleOpenSignup = () => {
    setIsLoginMode(false);
    setShowingLogin(true);
  };

  const handleClose = () => {
    setShowingLogin(false);
  };

  const handleLoginSuccess = () => {
    setShowingLogin(false);
    if (isPricing) {
      navigate('/pricing');
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
    window.location.reload();
  };

  return (
    <>
      {children({ handleOpenLogin, handleOpenSignup })}
      {showingLogin && (
        <Login
          onClose={handleClose}
          loginButton={isLoginMode}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default LoginHandler;