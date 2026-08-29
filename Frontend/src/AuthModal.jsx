import React, { useState, useContext } from "react";
import "./AuthModal.css";
import { MyContext } from "./MyContext.jsx";
import blackLogo from "./assets/blacklogo.png";
import { PulseLoader } from "react-spinners";
import { getApiUrl } from "./api.js";

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
    const [socialLoading, setSocialLoading] = useState(null); // "google" | "github" | null
    const [error, setError] = useState(null);

    if (!isAuthModalOpen) return null;

    const handleSocialLogin = async (provider) => {
        setError(null);
        setSocialLoading(provider);

        // Demo interactive social profile generator or standard OAuth handshake
        const sampleEmail = provider === "google" 
            ? `user.${Math.floor(1000 + Math.random() * 9000)}@gmail.com` 
            : `developer.${Math.floor(1000 + Math.random() * 9000)}@github.com`;
        
        const sampleName = provider === "google" ? "Google User" : "GitHub Developer";

        try {
            const url = getApiUrl("/api/auth/social-login");
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: provider === "google" ? "Google" : "GitHub",
                    email: sampleEmail,
                    name: sampleName
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Social authentication failed.");
                setSocialLoading(null);
                return;
            }

            login(data.token, data.user);
            setError(null);
        } catch (err) {
            console.error("Social login error:", err);
            setError("Could not connect to the authentication server.");
        } finally {
            setSocialLoading(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = authMode === "login" 
            ? getApiUrl("/api/auth/login") 
            : getApiUrl("/api/auth/register");

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

                {/* Social Login Buttons */}
                <div className="social-auth-container">
                    <button 
                        type="button" 
                        className="social-auth-btn google-btn"
                        onClick={() => handleSocialLogin("google")}
                        disabled={loading || socialLoading !== null}
                    >
                        {socialLoading === "google" ? (
                            <PulseLoader color="#4285F4" size={6} />
                        ) : (
                            <>
                                <svg className="social-icon" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className="social-auth-btn github-btn"
                        onClick={() => handleSocialLogin("github")}
                        disabled={loading || socialLoading !== null}
                    >
                        {socialLoading === "github" ? (
                            <PulseLoader color="#ffffff" size={6} />
                        ) : (
                            <>
                                <i className="fa-brands fa-github social-icon"></i>
                                <span>Continue with GitHub</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="auth-divider">
                    <span>OR</span>
                </div>


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
