import "./Chat.css";
import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import blackLogo from "./assets/blacklogo.png";

const SUGGESTIONS = [
    { title: "Explain a concept", desc: "How do transformer neural networks work?", icon: "fa-lightbulb" },
    { title: "Write code", desc: "Build a REST API endpoint in Node.js", icon: "fa-code" },
    { title: "Debug & Optimize", desc: "Why is my React component re-rendering?", icon: "fa-bug" },
    { title: "Brainstorm ideas", desc: "Creative SaaS product ideas for 2026", icon: "fa-wand-magic-sparkles" }
];

function Chat() {
    const { newChat, prevChats, reply, setPrompt } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const [speakingIdx, setSpeakingIdx] = useState(null);
    const [copiedIdx, setCopiedIdx] = useState(null);
    
    const containerRef = useRef(null);
    const chatEndRef = useRef(null);
    const isAutoScrolling = useRef(false);

    // Scroll listener to detect if the user scrolled up
    const handleScroll = useCallback(() => {
        if (!containerRef.current || isAutoScrolling.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isUp = scrollHeight - scrollTop - clientHeight > 90;
        setUserScrolledUp(isUp);
    }, []);

    const scrollToBottom = (behavior = "smooth") => {
        isAutoScrolling.current = true;
        chatEndRef.current?.scrollIntoView({ behavior });
        setUserScrolledUp(false);
        setTimeout(() => {
            isAutoScrolling.current = false;
        }, 300);
    };

    // Auto-scroll when new messages appear or stream only if user hasn't scrolled up
    useEffect(() => {
        if (!userScrolledUp) {
            scrollToBottom("instant");
        }
    }, [prevChats, latestReply, userScrolledUp]);

    // On new user prompt, force scroll to bottom
    useEffect(() => {
        if (reply !== null) {
            setUserScrolledUp(false);
            scrollToBottom("smooth");
        }
    }, [reply]);

    useEffect(() => {
        if (!reply) {
            setLatestReply(null);
            return;
        }

        if (!prevChats?.length) return;

        // Split while capturing whitespace & newlines to preserve markdown structure
        const tokens = reply.split(/(\s+)/);
        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(tokens.slice(0, idx + 1).join(""));
            idx++;
            if (idx >= tokens.length) {
                clearInterval(interval);
                setLatestReply(null); // Switch to full final markdown render
            }
        }, 20);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    // Stop speaking when unmounting or switching threads
    useEffect(() => {
        return () => {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [prevChats]);

    const handleSuggestionClick = (text) => {
        setPrompt(text);
    };

    // Text-to-Speech (Read Aloud)
    const toggleSpeech = (text, idx) => {
        if (!("speechSynthesis" in window)) {
            alert("Text-to-speech is not supported in your browser.");
            return;
        }

        if (speakingIdx === idx) {
            window.speechSynthesis.cancel();
            setSpeakingIdx(null);
            return;
        }

        window.speechSynthesis.cancel();

        // Clean markdown symbols for clearer speech
        const cleanText = text
            .replace(/```[\s\S]*?```/g, "Code block omitted.")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/#+\s?/g, "")
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setSpeakingIdx(null);
        };

        utterance.onerror = () => {
            setSpeakingIdx(null);
        };

        setSpeakingIdx(idx);
        window.speechSynthesis.speak(utterance);
    };

    // Copy response text
    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 2000);
        });
    };

    // Custom Markdown component renderers for tables
    const markdownComponents = {
        table: ({ node, ...props }) => (
            <div className="table-responsive-wrapper">
                <table {...props} />
            </div>
        )
    };

    return (
        <div 
            className="chat-container" 
            ref={containerRef}
            onScroll={handleScroll}
        >
            {newChat && (!prevChats || prevChats.length === 0) ? (
                <div className="empty-state">
                    <div className="hero-badge">
                        <img src={blackLogo} alt="Logo" className="hero-logo" />
                    </div>
                    <h1 className="hero-title">How can I help you today?</h1>
                    <p className="hero-subtitle">Ask questions, generate code, debug, or brainstorm new ideas.</p>

                    <div className="suggestions-grid">
                        {SUGGESTIONS.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="suggestion-card"
                                onClick={() => handleSuggestionClick(item.desc)}
                            >
                                <div className="suggestion-header">
                                    <i className={`fa-solid ${item.icon} suggestion-icon`}></i>
                                    <span className="suggestion-card-title">{item.title}</span>
                                </div>
                                <p className="suggestion-card-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="messages-list">
                    {prevChats?.slice(0, -1).map((chat, idx) => (
                        <div className={`message-row ${chat.role === "user" ? "user-row" : "gpt-row"}`} key={idx}>
                            <div className="avatar-wrapper">
                                {chat.role === "user" ? (
                                    <div className="user-avatar"><i className="fa-solid fa-user"></i></div>
                                ) : (
                                    <div className="gpt-avatar"><img src={blackLogo} alt="AI" /></div>
                                )}
                            </div>
                            <div className="message-content">
                                {chat.role === "user" ? (
                                    <p className="user-text">{chat.content}</p>
                                ) : (
                                    <>
                                        <div className="markdown-body">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]} 
                                                rehypePlugins={[rehypeHighlight]}
                                                components={markdownComponents}
                                            >
                                                {chat.content}
                                            </ReactMarkdown>
                                        </div>
                                        <div className="message-actions-bar">
                                            <button 
                                                className={`msg-action-btn ${speakingIdx === idx ? "active" : ""}`}
                                                onClick={() => toggleSpeech(chat.content, idx)}
                                                title={speakingIdx === idx ? "Stop reading" : "Read aloud"}
                                            >
                                                <i className={`fa-solid ${speakingIdx === idx ? "fa-stop" : "fa-volume-high"}`}></i>
                                                <span>{speakingIdx === idx ? "Stop" : "Read Aloud"}</span>
                                            </button>
                                            <button 
                                                className={`msg-action-btn ${copiedIdx === idx ? "copied" : ""}`}
                                                onClick={() => handleCopy(chat.content, idx)}
                                                title="Copy to clipboard"
                                            >
                                                <i className={`fa-solid ${copiedIdx === idx ? "fa-check" : "fa-copy"}`}></i>
                                                <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {prevChats && prevChats.length > 0 && (
                        <div className="message-row gpt-row" key="active-reply">
                            <div className="avatar-wrapper">
                                <div className="gpt-avatar"><img src={blackLogo} alt="AI" /></div>
                            </div>
                            <div className="message-content">
                                <div className="markdown-body">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]} 
                                        rehypePlugins={[rehypeHighlight]}
                                        components={markdownComponents}
                                    >
                                        {latestReply !== null ? latestReply : prevChats[prevChats.length - 1].content}
                                    </ReactMarkdown>
                                </div>
                                {latestReply === null && (
                                    <div className="message-actions-bar">
                                        <button 
                                            className={`msg-action-btn ${speakingIdx === prevChats.length - 1 ? "active" : ""}`}
                                            onClick={() => toggleSpeech(prevChats[prevChats.length - 1].content, prevChats.length - 1)}
                                            title={speakingIdx === prevChats.length - 1 ? "Stop reading" : "Read aloud"}
                                        >
                                            <i className={`fa-solid ${speakingIdx === prevChats.length - 1 ? "fa-stop" : "fa-volume-high"}`}></i>
                                            <span>{speakingIdx === prevChats.length - 1 ? "Stop" : "Read Aloud"}</span>
                                        </button>
                                        <button 
                                            className={`msg-action-btn ${copiedIdx === prevChats.length - 1 ? "copied" : ""}`}
                                            onClick={() => handleCopy(prevChats[prevChats.length - 1].content, prevChats.length - 1)}
                                            title="Copy to clipboard"
                                        >
                                            <i className={`fa-solid ${copiedIdx === prevChats.length - 1 ? "fa-check" : "fa-copy"}`}></i>
                                            <span>{copiedIdx === prevChats.length - 1 ? "Copied" : "Copy"}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            )}

            {/* Floating Scroll to Bottom Button */}
            {userScrolledUp && (
                <button 
                    className="scroll-bottom-btn" 
                    onClick={() => scrollToBottom("smooth")}
                    title="Jump to bottom"
                >
                    <i className="fa-solid fa-arrow-down"></i>
                </button>
            )}
        </div>
    );
}

export default Chat;


