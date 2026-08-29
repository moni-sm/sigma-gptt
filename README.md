# ⚡ SigmaGPT — Fullstack AI Chat Assistant

A modern, fast, and feature-rich AI chat application inspired by ChatGPT, built with the **MERN Stack (MongoDB, Express, React, Node.js)**, **Vite**, and **Tailored AI Model Integrations (Groq, Google Gemini, OpenAI)**.

---

## ✨ Features

- 💬 **Interactive AI Chat**: Real-time message streaming with support for coding, reasoning, and brainstorming.
- 📑 **Rich Markdown & Code Highlighting**: Full support for GitHub-Flavored Markdown (tables, blockquotes, syntax-highlighted code blocks with Atom One Dark theme).
- 📜 **Smart User-Controlled Scrolling**: Auto-scroll tracks AI responses automatically, but intelligently pauses when you scroll up so you can read without being dragged down. Includes a floating "Scroll to Bottom" button (`↓`).
- 📁 **Collapsible Sidebar & Chat History**: Save, switch, and manage previous conversations persisted in MongoDB. Collapses smoothly for an expansive workspace.
- 🗑️ **Safe Chat Deletion**: Built-in modal confirmation dialog to prevent accidental deletion of important chats.
- ⚡ **Multi-Provider AI Engine**:
  - **Groq Cloud** (Llama 3.3 70B / Llama 3.1 8B — ultra-fast & free)
  - **Google Gemini** (Gemini 1.5 / 2.0 Flash)
  - **OpenAI** (GPT-4o-mini)
  - **Zero-Config Fallback Assistant**
- 🔄 **CI/CD with GitHub Actions**: Automated syntax checking, dependency validation, and production bundle verification on every push and pull request.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Modern Vanilla CSS (Design Tokens, Glassmorphism, Responsive Grid/Flexbox)
- **Markdown Rendering**: `react-markdown`, `remark-gfm` (Tables & Strikethroughs), `rehype-highlight`
- **Icons**: FontAwesome 6
- **Spinners**: `react-spinners`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **CORS & Environment**: `cors`, `dotenv`
- **AI Integrations**: Groq Cloud, Google AI Studio, OpenAI API

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or [MongoDB Atlas](https://cloud.mongodb.com/))
- *(Optional)* Free [Groq API Key](https://console.groq.com/keys) or [Google Gemini Key](https://aistudio.google.com/apikey)

---

### 2. Clone the Repository

```bash
git clone https://github.com/moni-sm/sigma-gptt.git
cd sigma-gptt
```

---

### 3. Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file inside the `Backend` directory based on `.env.example`.
   - Configure your `MONGODB_URI` and AI API key (`GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY`).
4. Start the backend server:
   ```bash
   node server.js
   # Or with automatic reload:
   npm run dev
   ```
   *The server runs on **http://localhost:8080**.*


---

### 4. Frontend Setup

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at **http://localhost:5173**.

---

## 📁 Project Structure

```text
sigma-gptt/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── Backend/
│   ├── models/
│   │   └── Thread.js           # Mongoose Thread & Message schemas
│   ├── routes/
│   │   └── chat.js             # Chat API & Thread endpoints
│   ├── utils/
│   │   └── openai.js           # Multi-provider LLM connector
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server.js               # Express entrypoint
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Brand logos & graphics
│   │   ├── App.jsx             # Root layout & state provider
│   │   ├── App.css
│   │   ├── Chat.jsx            # Chat feed & markdown renderer
│   │   ├── Chat.css
│   │   ├── ChatWindow.jsx      # Top navbar & input dock
│   │   ├── ChatWindow.css
│   │   ├── Sidebar.jsx         # Collapsible history sidebar & modal
│   │   ├── Sidebar.css
│   │   ├── MyContext.jsx       # Global context
│   │   └── index.css           # Global design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 🔄 CI/CD Pipeline

This repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically runs on every push or pull request to `main`:
- **Backend CI**: Validates syntax and module integrity.
- **Frontend CI**: Validates dependencies and tests the production Vite build (`npm run build`).

---

## 📜 License

Distributed under the MIT License.
