import React from 'react';
import { useState } from 'react';
import '../styles/Modal.css';
import logo from '../assets/makcorpLogoWithText.png';
import { motion } from 'framer-motion';

const Login = ({ onClose }) => {

    const [isLogin, setIsLogin] = useState(true);

return (
    <motion.div
        className="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.div 
            className="modal-content"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
        >
            <button className="close-button" onClick={onClose}>&times;</button>
            <div className="logo-container">
                <img src={logo} alt="MakCorp Logo" className="logo" />
            </div>
            <div className="toggle-container">
                <button 
                    className={`toggle-button ${isLogin ? 'active' : ''}`} 
                    onClick={() => setIsLogin(true)}
                >
                    Login
                </button>
                <button 
                    className={`toggle-button ${!isLogin ? 'active' : ''}`} 
                    onClick={() => setIsLogin(false)}
                >
                    Sign Up
                </button>
            </div>
            <form className="auth-form">
                <input 
                    type="email" 
                    placeholder="Email address" 
                    required 
                    className="auth-input"
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    className="auth-input"
                />
                <div className="options-container">
                    <label className="remember-me">
                        <input type="checkbox" /> Remember me
                    </label>
                    <a href="#" className="forgot-password">Forgot your password?</a>
                </div>
                <button 
                    type="submit" 
                    className="auth-button"
                >
                    {isLogin ? "Sign in" : "Sign Up"}
                </button>
            </form>
        </motion.div>
    </motion.div>
);
};

export default Login;