# ⚡ SigmaGPT — Fullstack AI Chat Assistant

[![Live Demo](https://img.shields.io/badge/Live_Demo-HTTPS_Active-success?style=for-the-badge&logo=googlechrome&logoColor=white)](https://moni-sigmagpt.duckdns.org)
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/moni-sm/sigma-gptt/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/moni-sm/sigma-gptt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, fast, and feature-rich AI chat application inspired by ChatGPT, built with the **MERN Stack (MongoDB, Express, React, Node.js)**, **Vite**, and **Multi-Provider AI Engines (Groq, Google Gemini, OpenAI)**.

---

## ✨ Features

- 💬 **Interactive AI Chat**: Real-time message streaming with support for coding, reasoning, and brainstorming.
- 🔒 **User Authentication & Authorization**: Secure JWT-based authentication with `bcryptjs` password hashing and user thread isolation.
- 🌐 **Google & GitHub Social Single Sign-On**: One-click social login via Google and GitHub in addition to standard email registration.
- ☀️🌙 **Light & Dark Theme Mode**: Seamless theme switching with custom CSS design tokens and `localStorage` persistence.
- 🤖 **Interactive AI Model Selector**: Switch on-the-fly between:
  - **SigmaGPT 4o-mini** (Default balanced intelligence)
  - **Llama 3.3 70B** (Meta — High-speed reasoning via Groq)
  - **Qwen 2.5 32B** (Alibaba — Advanced coding & mathematics)
  - **Gemini 1.5 Flash** (Google — Ultra-fast concise responses)
- 🎙️ **Voice Input (Speech-to-Text)**: Dedicated microphone button with real-time browser speech recognition dictation.
- 🔊 **Read Aloud (Text-to-Speech)**: Listen to AI responses with natural browser speech synthesis audio playback.
- 📋 **One-Click Markdown Copy**: Instant response copying with visual checkmark feedback.
- 📑 **Rich Markdown & Code Highlighting**: Full support for GitHub-Flavored Markdown (tables, blockquotes, syntax-highlighted code blocks with Atom One Dark theme).
- 📜 **Smart Auto-Scrolling**: Auto-scroll tracks AI responses automatically, and pauses when scrolling up with a floating "Scroll to Bottom" button (`↓`).
- 📁 **Collapsible Sidebar & Chat History**: Save, switch, and manage previous conversations persisted in MongoDB.
- 🗑️ **Safe Chat Deletion**: Built-in modal confirmation dialog to prevent accidental deletion of important chats.
- 🔄 **CI/CD with GitHub Actions**: Automated syntax checking, dependency validation, and production bundle verification on every push and pull request.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Modern Vanilla CSS (Design Tokens, Glassmorphism, Responsive Grid/Flexbox)
- **Markdown & Code**: `react-markdown`, `remark-gfm` (GFM Tables), `rehype-highlight` (Highlight.js)
- **Icons & UI**: FontAwesome 6, `react-spinners`
- **Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas & Mongoose
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`
- **AI Integrations**: Groq Cloud (Llama 3.3 70B), Google AI Studio (Gemini 1.5 Flash), OpenAI API

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
   npm install
   ```
2. Set up environment variables:
   - Create a `.env` file inside `Backend/` based on `.env.example`:
   ```env
   PORT=8080
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sigmagpt?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   GROQ_API_KEY=gsk_your_free_groq_api_key
   # GEMINI_API_KEY=your_gemini_api_key
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *Server runs on **http://localhost:8080**.*

---

### 4. Frontend Setup

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at **http://localhost:5173**.

---

## ☁️ AWS EC2 & HTTPS Production Deployment

### 1. EC2 Instance Setup (Amazon Linux 2023 / Ubuntu)
```bash
# Update packages and install Node.js 20, Git, and Nginx
sudo dnf update -y
sudo dnf install -y nodejs git nginx
sudo npm install -g pm2
```

### 2. Run Backend with PM2
```bash
cd /home/ec2-user/sigma-gptt/Backend
npm install
pm2 start server.js --name "sigmagpt-backend"
pm2 save
pm2 startup
```

### 3. Build Frontend & Configure Nginx
```bash
# Build frontend
cd /home/ec2-user/sigma-gptt/Frontend
npm install
npm run build

# Apply Nginx configuration
sudo cp /home/ec2-user/sigma-gptt/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Setup SSL with Let's Encrypt (Certbot)
```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d moni-sigmagpt.duckdns.org
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with email & password | No |
| `POST` | `/api/auth/login` | Login user and receive 7-day JWT token | No |
| `POST` | `/api/auth/social-login` | Google & GitHub SSO authentication | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes (`Bearer <token>`) |
| `POST` | `/api/chat` | Send message and receive AI completion | Optional |
| `GET` | `/api/thread` | Retrieve conversation history for active user | Optional |
| `GET` | `/api/thread/:threadId` | Retrieve all messages of a specific thread | Optional |
| `DELETE` | `/api/thread/:threadId` | Delete a specific conversation thread | Optional |
| `GET` | `/api/health` | Backend and database health status check | No |

---

## 📁 Project Structure

```text
sigma-gptt/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── Backend/
│   ├── middleware/
│   │   └── auth.js             # requireAuth & optionalAuth JWT middleware
│   ├── models/
│   │   ├── Thread.js           # Mongoose Thread & Message schemas
│   │   └── User.js             # Mongoose User account schema
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints (Register, Login, Social)
│   │   └── chat.js             # Chat API & Thread endpoints
│   ├── utils/
│   │   └── openai.js           # Multi-provider LLM connector (Groq, Gemini, OpenAI)
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Express entrypoint
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Brand logos & graphics
│   │   ├── api.js              # Dynamic API URL resolver
│   │   ├── App.jsx             # Root layout & global state provider
│   │   ├── App.css
│   │   ├── AuthModal.jsx       # Sign In / Sign Up & Social Login modal
│   │   ├── AuthModal.css
│   │   ├── Chat.jsx            # Chat feed, speech output, markdown renderer
│   │   ├── Chat.css
│   │   ├── ChatWindow.jsx      # Top navbar, model selector, mic input dock
│   │   ├── ChatWindow.css
│   │   ├── Sidebar.jsx         # Collapsible history sidebar, user badge, modal
│   │   ├── Sidebar.css
│   │   ├── MyContext.jsx       # Global state context
│   │   └── index.css           # Global theme tokens & design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Vite configuration & dev proxy
├── nginx.conf                  # Production reverse proxy configuration
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔄 CI/CD Pipeline

This repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically runs on every push or pull request to `main`:
- **Backend CI**: Validates syntax and module integrity.
- **Frontend CI**: Validates dependencies and tests the production Vite build (`npm run build`).

---

## 📜 License & Copyright

Copyright © 2026 [moni-sm](https://github.com/moni-sm). All rights reserved.

Distributed under the [MIT License](LICENSE).
