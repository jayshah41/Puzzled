import React from 'react';
import { useState } from 'react';
import '../styles/Modal.css';
import logo from '../assets/makcorpLogoWithText.png';
import { motion } from 'framer-motion';

const Login = ({ onClose, loginButton }) => {

    const [isLogin, setIsLogin] = useState(loginButton);

    const commodityOptions = ["Aluminum", "Coal", "Cobalt", "Copper", "Gold", "Graphite", "Halloysite", "Iron Ore", "Lithium", "Magnesium", "Manganese", "Mineral Sands", "Molybdenum", "Nickel", "Oil & Gas", "Palladium", "Platinum", "Potash", "Rare Earths", "Scandium", "Tantalum", "Tin", "Titanium", "Tungsten", "Uranium", "Vanadium", "Zinc"]
    const options = commodityOptions.map(e => <option value={e}>{e}</option>)

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
            { isLogin ?
            <form className="auth-form">
                <input 
                    type="email" placeholder="Email address" className="auth-input" required />
                <input type="password" placeholder="Password" className="auth-input" required />
                <div className="options-container">
                    <label className="remember-me">

                        <input type="checkbox" className="tick-box" /> Remember me

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

            :

            <form className="auth-form">
                <p>User Information</p>
                <input type="text" placeholder="First Name" className="auth-input" required />
                <input type="text" placeholder="Last Name" className="auth-input" required />
                <input type="email" placeholder="Email address" className="auth-input" required />
                <input type="text" placeholder="Phone Number" className="auth-input" required />
                <input type="text" placeholder="Country" className="auth-input" required />
                <input type="text" placeholder="State" className="auth-input" required />
                <p>What are your top 3 priority commodities?</p>
                <select id="commodity1" className="auth-input" required>
                    <option value="">Select Commodity 1</option>
                    {options}
                </select>
                <select id="commodity1" className="auth-input" required>
                    <option value="">Select Commodity 2</option>
                    {options}
                </select>
                <select id="commodity1" className="auth-input" required>
                    <option value="">Select Commodity 3</option>
                    {options}
                </select>
                <p>Password</p>
                <input type="password" placeholder="Password" className="auth-input" required />
                <button 
                    type="submit" 
                    className="auth-button"
                >Sign Up
                </button>
            </form>
            }
        </motion.div>
    </motion.div>
);
};

export default Login;