import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Modal.css";
import logo from "../assets/makcorpLogoWithText.png";
import { motion } from "framer-motion";

const Login = ({ onClose, loginButton, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(loginButton);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        country: "",
        state: "",
        commodities: ["", "", ""]
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");



    const commodityOptions = [
        "Aluminum", "Coal", "Cobalt", "Copper", "Gold", "Graphite",
        "Halloysite", "Iron Ore", "Lithium", "Magnesium", "Manganese",
        "Mineral Sands", "Molybdenum", "Nickel", "Oil & Gas", "Palladium",
        "Platinum", "Potash", "Rare Earths", "Scandium", "Tantalum", "Tin",
        "Titanium", "Tungsten", "Uranium", "Vanadium", "Zinc"
    ];

    const options = commodityOptions.map(e => <option key={e} value={e}>{e}</option>);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCommodityChange = (index, value) => {
        const updatedCommodities = [...formData.commodities];
        updatedCommodities[index] = value;
        setFormData(prevState => ({ ...prevState, commodities: updatedCommodities }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            if (!response.ok) throw new Error("Invalid credentials");

            const data = await response.json();
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);

            const userResponse = await fetch("/api/profile/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${data.access}`
                },
            });

            if (!userResponse.ok) throw new Error("Failed to fetch user data");

            const userData = await userResponse.json();
            localStorage.setItem("user_tier_level", userData.tier_level);

            onLoginSuccess();


        } catch (error) {
            setError(error.message);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    username: formData.username, 
                    email: formData.email,
                    phone_number: formData.phoneNumber,
                    country: formData.country,
                    state: formData.state,
                    commodities: formData.commodities,
                    password: formData.password,
                    tier_level: 1,
                }),
            });

            if (!response.ok) throw new Error("Signup failed, try again");

            setSuccessMessage("Account created successfully! You can now log in.");

            setIsLogin(true);

        } catch (error) {
            setError(error.message);
        }
    };

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

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}


                {isLogin ? (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            type="email" placeholder="Email address" className="auth-input"
                            name="email" value={formData.email} onChange={handleChange} required
                        />
                        <input
                            type="password" placeholder="Password" className="auth-input"
                            name="password" value={formData.password} onChange={handleChange} required
                        />
                        <div className="options-container">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot your password?</a>
                        </div>
                        <button type="submit" className="auth-button">Sign in</button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleSignup}>
                        <p>User Information</p>
                        <input type="text" placeholder="First Name" className="auth-input" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        <input type="text" placeholder="Last Name" className="auth-input" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        <input type="text" placeholder="Username" className="auth-input" name="username" value={formData.username} onChange={handleChange} required />

                        <input type="email" placeholder="Email address" className="auth-input" name="email" value={formData.email} onChange={handleChange} required />
                        <input type="text" placeholder="Phone Number" className="auth-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                        <input type="text" placeholder="Country" className="auth-input" name="country" value={formData.country} onChange={handleChange} required />
                        <input type="text" placeholder="State" className="auth-input" name="state" value={formData.state} onChange={handleChange} required />
                        <p>What are your top 3 priority commodities?</p>
                        {formData.commodities.map((commodity, index) => (
                            <select
                                key={index}
                                className="auth-input"
                                value={commodity}
                                onChange={(e) => handleCommodityChange(index, e.target.value)}
                                required
                            >
                                {options}
                            </select>
                        ))}
                        <p>Password</p>
                        <input type="password" placeholder="Password" className="auth-input" name="password" value={formData.password} onChange={handleChange} required />
                        <button type="submit" className="auth-button">Sign Up</button>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Login;