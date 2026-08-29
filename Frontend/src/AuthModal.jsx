import React, { useState, useContext } from "react";
import "./AuthModal.css";
import { MyContext } from "./MyContext.jsx";
import blackLogo from "./assets/blacklogo.png";
import { PulseLoader } from "react-spinners";

function AuthModal() {
    const { 
        isAuthModalOpen, 
        setIsAuthModalOpen, 
        authMode, 
        setAuthMode, 
        login 
    } = useContext(MyContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isAuthModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = authMode === "login" 
            ? "http://localhost:8080/api/auth/login" 
            : "http://localhost:8080/api/auth/register";

        const payload = authMode === "login" 
            ? { email, password } 
            : { name, email, password };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Authentication failed. Please try again.");
                setLoading(false);
                return;
            }

            // Success! Save token and user details
            login(data.token, data.user);
            setName("");
            setEmail("");
            setPassword("");
            setError(null);
        } catch (err) {
            console.error("Auth submit error:", err);
            setError("Could not connect to the authentication server. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = (mode) => {
        setAuthMode(mode);
        setError(null);
    };

    return (
        <div className="auth-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                <button 
                    className="auth-modal-close" 
                    onClick={() => setIsAuthModalOpen(false)}
                    title="Close"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="auth-modal-header">
                    <div className="auth-logo-badge">
                        <img src={blackLogo} alt="Logo" />
                    </div>
                    <h2>{authMode === "login" ? "Welcome back" : "Create an account"}</h2>
                    <p>{authMode === "login" ? "Sign in to access your saved chat history." : "Sign up to sync your chats across devices."}</p>
                </div>

                <div className="auth-tabs">
                    <button 
                        type="button"
                        className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                        onClick={() => toggleMode("login")}
                    >
                        Sign In
                    </button>
                    <button 
                        type="button"
                        className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                        onClick={() => toggleMode("register")}
                    >
                        Sign Up
                    </button>
                </div>

                {error && (
                    <div className="auth-error-banner">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {authMode === "register" && (
                        <div className="auth-field">
                            <label>Full Name</label>
                            <div className="auth-input-wrapper">
                                <i className="fa-regular fa-user input-icon"></i>
                                <input 
                                    type="text" 
                                    placeholder="Jane Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    <div className="auth-field">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-regular fa-envelope input-icon"></i>
                            <input 
                                type="email" 
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-solid fa-lock input-icon"></i>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder={authMode === "register" ? "At least 6 characters" : "Enter your password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <PulseLoader color="#ffffff" size={7} />
                        ) : (
                            authMode === "login" ? "Sign In" : "Create Account"
                        )}
                    </button>
                </form>

                <div className="auth-modal-footer">
                    {authMode === "login" ? (
                        <p>
                            Don't have an account?{" "}
                            <button type="button" className="auth-link-btn" onClick={() => toggleMode("register")}>
                                Sign up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <button type="button" className="auth-link-btn" onClick={() => toggleMode("login")}>
                                Sign in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
