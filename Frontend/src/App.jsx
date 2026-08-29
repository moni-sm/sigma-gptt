import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import AuthModal from "./AuthModal.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); // stores all chats of curr threads
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // Theme State ("dark" | "light")
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sigmagpt_theme") || "dark";
  });

  // Sync theme with document attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sigmagpt_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Load token & user from localStorage on initial startup
  useEffect(() => {
    const savedToken = localStorage.getItem("sigmagpt_token");
    const savedUser = localStorage.getItem("sigmagpt_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("sigmagpt_token");
        localStorage.removeItem("sigmagpt_user");
      }
    }
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("sigmagpt_token", newToken);
    localStorage.setItem("sigmagpt_user", JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sigmagpt_token");
    localStorage.removeItem("sigmagpt_user");
    setAllThreads([]);
    createNewChat();
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    isSidebarOpen, setIsSidebarOpen,
    createNewChat,
    user, setUser,
    token, setToken,
    isAuthModalOpen, setIsAuthModalOpen,
    authMode, setAuthMode,
    login, logout, openAuthModal,
    theme, setTheme, toggleTheme
  }; 


  return (
    <div className={`app ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
        <AuthModal />
      </MyContext.Provider>
    </div>
  );
}

export default App;


