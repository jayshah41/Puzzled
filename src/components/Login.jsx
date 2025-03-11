import React, { useState } from "react";
import "../styles/Modal.css";
import logo from "../assets/makcorpLogoWithText.png";
import { motion } from "framer-motion";

const Login = ({ onClose, loginButton }) => {
    const [isLogin, setIsLogin] = useState(loginButton);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [commodity1, setCommodity1] = useState("");
    const [commodity2, setCommodity2] = useState("");
    const [commodity3, setCommodity3] = useState("");

    const commodityOptions = [
        "Aluminum", "Coal", "Cobalt", "Copper", "Gold", "Graphite",
        "Halloysite", "Iron Ore", "Lithium", "Magnesium", "Manganese",
        "Mineral Sands", "Molybdenum", "Nickel", "Oil & Gas", "Palladium",
        "Platinum", "Potash", "Rare Earths", "Scandium", "Tantalum", "Tin",
        "Titanium", "Tungsten", "Uranium", "Vanadium", "Zinc"
    ];
    
    const options = commodityOptions.map(e => <option key={e} value={e}>{e}</option>);

    // 🔹 Handle Login Submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            console.log("Attempting to log in..."); // Log start of login attempt
            const response = await fetch("/api/token/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            console.log("Login response status:", response.status); // Log response status
    
            if (!response.ok) throw new Error("Invalid credentials");
    
            const data = await response.json();
            console.log("Login successful, access token received:", data.access); // Log access token
    
            localStorage.setItem("accessToken", data.access);
    
            // Fetch user details after login
            const userResponse = await fetch("/api/current-user/", {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${data.access}`
                },
            });
    
            console.log("User details response status:", userResponse.status); // Log user details response status
    
            if (!userResponse.ok) throw new Error("Failed to fetch user data");
    
            const userData = await userResponse.json();
            console.log("User details fetched:", userData); // Log user details
    
            alert(`Welcome ${userData.email}! Your access level: ${userData.tier_level}`);
    
            // Redirect user based on role
            if (userData.is_admin) {
                window.location.href = "/admin-dashboard";
            } else {
                window.location.href = "/user-dashboard";
            }
    
        } catch (error) {
            console.error("Login error:", error); // Log any errors
            setError(error.message);
        }
    };

    // 🔹 Handle Signup Submission
    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone_number: phoneNumber,
                    country,
                    state,
                    commodities: [commodity1, commodity2, commodity3],  // Combine the commodities into a list
                    password,
                    tier_level: 1,  // Default tier level for new users
                    user_type: "client"
                }),
            });

            if (!response.ok) throw new Error("Signup failed, try again");

            alert("Account created successfully! Please log in.");
            setIsLogin(true);  // Switch to login form after signup

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

                { isLogin ? (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <input 
                            type="email" placeholder="Email address" className="auth-input" 
                            value={email} onChange={(e) => setEmail(e.target.value)} required
                        />
                        <input 
                            type="password" placeholder="Password" className="auth-input" 
                            value={password} onChange={(e) => setPassword(e.target.value)} required
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
                        <input type="text" placeholder="First Name" className="auth-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        <input type="text" placeholder="Last Name" className="auth-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        <input type="email" placeholder="Email address" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="text" placeholder="Phone Number" className="auth-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                        <input type="text" placeholder="Country" className="auth-input" value={country} onChange={(e) => setCountry(e.target.value)} required />
                        <input type="text" placeholder="State" className="auth-input" value={state} onChange={(e) => setState(e.target.value)} required />
                        <p>What are your top 3 priority commodities?</p>
                        <select className="auth-input" value={commodity1} onChange={(e) => setCommodity1(e.target.value)} required>{options}</select>
                        <select className="auth-input" value={commodity2} onChange={(e) => setCommodity2(e.target.value)} required>{options}</select>
                        <select className="auth-input" value={commodity3} onChange={(e) => setCommodity3(e.target.value)} required>{options}</select>
                        <p>Password</p>
                        <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit" className="auth-button">Sign Up</button>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Login;
