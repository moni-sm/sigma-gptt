import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import blackLogo from "./assets/blacklogo.png";
import { getApiUrl } from "./api.js";

function Sidebar() {
    const { 
        allThreads, 
        setAllThreads, 
        currThreadId, 
        setCurrThreadId, 
        setPrevChats, 
        setNewChat, 
        setReply, 
        isSidebarOpen, 
        setIsSidebarOpen, 
        createNewChat,
        user,
        token,
        logout,
        openAuthModal
    } = useContext(MyContext);

    const [threadToDelete, setThreadToDelete] = useState(null);

    const getAllThreads = async () => {
        try {
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};
            const response = await fetch(getApiUrl("/api/thread"), { headers });
            const res = await response.json();
            if (Array.isArray(res)) {
                const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
                setAllThreads(filteredData);
            } else {
                setAllThreads([]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, token]);

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};
            const response = await fetch(getApiUrl(`/api/thread/${newThreadId}`), { headers });
            const res = await response.json();
            setPrevChats(Array.isArray(res) ? res : []);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};
            const response = await fetch(getApiUrl(`/api/thread/${threadId}`), { 
                method: "DELETE",
                headers 
            });


            await response.json();

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div 
                className={`sidebar-backdrop ${isSidebarOpen ? "visible" : ""}`} 
                onClick={() => setIsSidebarOpen(false)}
            />

            <aside className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={createNewChat} title="Start a new conversation">
                        <div className="btn-brand">
                            <img src={blackLogo} alt="SigmaGPT logo" className="logo" />
                            <span className="btn-text">New Chat</span>
                        </div>
                        <span className="btn-icon"><i className="fa-solid fa-pen-to-square"></i></span>
                    </button>

                    <button 
                        className="sidebar-collapse-btn" 
                        onClick={() => setIsSidebarOpen(false)}
                        title="Close sidebar"
                    >
                        <i className="fa-solid fa-angles-left"></i>
                    </button>
                </div>

                <div className="history-section">
                    <span className="history-title">Recent Chats</span>
                    <ul className="history-list">
                        {allThreads && allThreads.length > 0 ? (
                            allThreads.map((thread, idx) => (
                                <li 
                                    key={idx} 
                                    onClick={() => changeThread(thread.threadId)}
                                    className={`history-item ${thread.threadId === currThreadId ? "active" : ""}`}
                                >
                                    <i className="fa-regular fa-message item-icon"></i>
                                    <span className="item-title" title={thread.title}>{thread.title}</span>
                                    <button 
                                        className="delete-btn"
                                        title="Delete chat"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setThreadToDelete(thread);
                                        }}
                                    >
                                        <i className="fa-regular fa-trash-can"></i>
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="history-empty">No previous chats</li>
                        )}
                    </ul>
                </div>

                <div className="sidebar-footer">
                    {user ? (
                        <div className="user-profile-bar">
                            <div className="user-avatar-badge" title={user.email}>
                                <span>{getInitials(user.name)}</span>
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                            <button 
                                className="logout-btn" 
                                onClick={logout}
                                title="Sign out"
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="sidebar-auth-btn" 
                            onClick={() => openAuthModal("login")}
                        >
                            <i className="fa-solid fa-arrow-right-to-bracket"></i>
                            <span>Sign In / Register</span>
                        </button>
                    )}

                    <div className="sign-badge">
                        <span>© 2026 SigmaGPT • by Moni</span>
                    </div>
                </div>

            </aside>

            {/* Delete Confirmation Modal */}
            {threadToDelete && (
                <div className="modal-overlay" onClick={() => setThreadToDelete(null)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon-danger">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h3>Delete chat?</h3>
                        </div>
                        <p className="modal-body">
                            This will delete <strong>"{threadToDelete.title}"</strong>. This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button 
                                className="modal-btn cancel-btn"
                                onClick={() => setThreadToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-btn delete-confirm-btn"
                                onClick={() => {
                                    deleteThread(threadToDelete.threadId);
                                    setThreadToDelete(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;


