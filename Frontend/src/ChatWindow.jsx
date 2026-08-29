import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { PulseLoader } from "react-spinners";
import { getApiUrl } from "./api.js";

const AVAILABLE_MODELS = [
    { id: "auto", name: "SigmaGPT", badge: "4o-mini", desc: "Default balanced intelligence", icon: "fa-wand-magic-sparkles" },
    { id: "llama-3.3-70b", name: "Llama 3.3", badge: "70B", desc: "High-speed reasoning by Meta", icon: "fa-bolt" },
    { id: "qwen-2.5-32b", name: "Qwen 2.5", badge: "32B", desc: "Advanced coding & mathematics", icon: "fa-code" },
    { id: "gemini-1.5-flash", name: "Gemini", badge: "Flash", desc: "Fast concise Google AI", icon: "fa-gem" }
];

function ChatWindow() {
    const { 
        prompt, 
        setPrompt, 
        reply, 
        setReply, 
        currThreadId, 
        setPrevChats, 
        setNewChat, 
        isSidebarOpen, 
        setIsSidebarOpen, 
        createNewChat,
        user,
        token,
        logout,
        openAuthModal,
        theme,
        toggleTheme
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
    const [isListening, setIsListening] = useState(false);

    const dropdownRef = useRef(null);
    const modelDropdownRef = useRef(null);
    const recognitionRef = useRef(null);

    const getReply = async () => {
        if (!prompt || !prompt.trim() || loading) return;

        const currentMessage = prompt.trim();
        setLoading(true);
        setNewChat(false);

        const headers = {
            "Content-Type": "application/json"
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const options = {
            method: "POST",
            headers,
            body: JSON.stringify({
                message: currentMessage,
                threadId: currThreadId,
                model: selectedModel.id
            })
        };

        try {
            const response = await fetch(getApiUrl("/api/chat"), options);
            const res = await response.json();


            setReply(res.reply || "No response received.");
        } catch (err) {
            console.log(err);
            setReply("Failed to connect to the backend server. Please verify your connection.");
        }
        setLoading(false);
    };

    // Append new chat to prevChats
    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => ([
                ...(prevChats || []),
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]));
        }
        setPrompt("");
    }, [reply]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
                setIsModelDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Speech-to-Text Voice Recognition
    const toggleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in your browser. Please try Google Chrome or Edge.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setPrompt(prev => (prev ? prev + " " + transcript : transcript));
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error("Failed to start speech recognition:", err);
            setIsListening(false);
        }
    };

    const handleProfileClick = () => {
        if (!user) {
            openAuthModal("login");
        } else {
            setIsOpen(!isOpen);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    return (
        <main className="chatWindow">
            <header className="navbar">
                <div className="navbar-left">
                    {!isSidebarOpen && (
                        <div className="sidebar-open-actions">
                            <button 
                                className="nav-icon-btn" 
                                onClick={() => setIsSidebarOpen(true)} 
                                title="Open sidebar"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <button 
                                className="nav-icon-btn" 
                                onClick={createNewChat} 
                                title="New chat"
                            >
                                <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                        </div>
                    )}

                    {/* Interactive Model Selector Dropdown */}
                    <div className="model-selector-container" ref={modelDropdownRef}>
                        <div 
                            className={`model-selector ${isModelDropdownOpen ? "active" : ""}`}
                            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                            title="Switch AI Model"
                        >
                            <span className="model-status-dot"></span>
                            <span className="model-name">{selectedModel.name}</span>
                            <span className="model-version">{selectedModel.badge}</span>
                            <i className={`fa-solid fa-chevron-down model-chevron ${isModelDropdownOpen ? "rotate" : ""}`}></i>
                        </div>

                        {isModelDropdownOpen && (
                            <div className="model-dropdown-menu">
                                <div className="model-dropdown-header">
                                    <span>Select Model</span>
                                </div>
                                <div className="model-options-list">
                                    {AVAILABLE_MODELS.map((item) => (
                                        <div 
                                            key={item.id}
                                            className={`model-option-card ${selectedModel.id === item.id ? "selected" : ""}`}
                                            onClick={() => {
                                                setSelectedModel(item);
                                                setIsModelDropdownOpen(false);
                                            }}
                                        >
                                            <div className="model-option-icon">
                                                <i className={`fa-solid ${item.icon}`}></i>
                                            </div>
                                            <div className="model-option-info">
                                                <div className="model-option-name-row">
                                                    <span className="option-name">{item.name}</span>
                                                    <span className="option-badge">{item.badge}</span>
                                                </div>
                                                <span className="option-desc">{item.desc}</span>
                                            </div>
                                            {selectedModel.id === item.id && (
                                                <i className="fa-solid fa-check selected-check"></i>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="navbar-right" ref={dropdownRef}>
                    <button 
                        className="theme-toggle-btn" 
                        onClick={toggleTheme} 
                        title={theme === "dark" ? "Switch to Light theme" : "Switch to Dark theme"}
                    >
                        <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
                    </button>

                    {user ? (
                        <div className="userIconDiv logged-in" onClick={handleProfileClick} title={user.email}>
                            <span className="user-initials">{getInitials(user.name)}</span>
                        </div>
                    ) : (
                        <button className="nav-login-btn" onClick={() => openAuthModal("login")}>
                            <i className="fa-solid fa-arrow-right-to-bracket"></i>
                            <span>Sign In</span>
                        </button>
                    )}

                    {user && isOpen && (
                        <div className="dropDown">
                            <div className="dropDownHeader">
                                <span className="user-dropdown-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                            <div className="dropDownDivider"></div>
                            <div className="dropDownItem logout" onClick={() => { setIsOpen(false); logout(); }}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <Chat />

            <div className="chatInputArea">
                {loading && (
                    <div className="typing-indicator-bar">
                        <PulseLoader color="#6366f1" size={8} speedMultiplier={0.8} />
                        <span>SigmaGPT is thinking...</span>
                    </div>
                )}

                <div className="inputBox">
                    <input 
                        placeholder={isListening ? "Listening... Speak now..." : "Message SigmaGPT..."}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                getReply();
                            }
                        }}
                        disabled={loading}
                    />

                    {/* Speech-to-Text Microphone Button */}
                    <button 
                        type="button"
                        className={`mic-btn ${isListening ? "listening" : ""}`}
                        onClick={toggleVoiceInput}
                        title={isListening ? "Stop listening" : "Voice input (Speak)"}
                    >
                        <i className="fa-solid fa-microphone"></i>
                        {isListening && <span className="mic-pulse-ring"></span>}
                    </button>

                    <button 
                        id="submit" 
                        onClick={getReply}
                        disabled={!prompt?.trim() || loading}
                        className={prompt?.trim() ? "active" : ""}
                        title="Send message"
                    >
                        <i className="fa-solid fa-arrow-up"></i>
                    </button>
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Verify important information. • © 2026 SigmaGPT. All rights reserved.
                </p>
            </div>
        </main>
    );
}

export default ChatWindow;
