import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { PulseLoader } from "react-spinners";

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
        createNewChat 
    } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const getReply = async () => {
        if (!prompt || !prompt.trim() || loading) return;

        const currentMessage = prompt.trim();
        setLoading(true);
        setNewChat(false);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: currentMessage,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
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

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
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

                    <div className="model-selector">
                        <span className="model-status-dot"></span>
                        <span className="model-name">SigmaGPT</span>
                        <span className="model-version">4o-mini</span>
                        <i className="fa-solid fa-chevron-down model-chevron"></i>
                    </div>
                </div>


                <div className="navbar-right" ref={dropdownRef}>
                    <div className="userIconDiv" onClick={handleProfileClick} title="User Account">
                        <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                    </div>

                    {isOpen && (
                        <div className="dropDown">
                            <div className="dropDownHeader">
                                <span className="user-email">user@sigmagpt.ai</span>
                                <span className="user-plan">Free Plan</span>
                            </div>
                            <div className="dropDownDivider"></div>
                            <div className="dropDownItem" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-gear"></i> Settings
                            </div>
                            <div className="dropDownItem" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                            </div>
                            <div className="dropDownDivider"></div>
                            <div className="dropDownItem logout" onClick={() => setIsOpen(false)}>
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
                        placeholder="Message SigmaGPT..."
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