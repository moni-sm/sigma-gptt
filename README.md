# ⚡ SigmaGPT — The AI Assistant 

[![Live Demo](https://img.shields.io/badge/Live_Demo-HTTPS_Cooking-success?style=for-the-badge&logo=googlechrome&logoColor=white)](https://moni-sigmagpt.duckdns.org)
[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/moni-sm/sigma-gptt/ci.yml?branch=main&label=CI&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/moni-sm/sigma-gptt/actions/workflows/ci.yml)
[![CD Pipeline](https://img.shields.io/github/actions/workflow/status/moni-sm/sigma-gptt/cd.yml?branch=main&label=CD&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/moni-sm/sigma-gptt/actions/workflows/cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Built with MERN](https://img.shields.io/badge/Stack-MERN_%2B_Vite-6366f1?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)

> **No cap, ChatGPT just got an upgrade.** 🚀  
> **SigmaGPT** is a fullstack, hyper-responsive AI platform built for devs, creators, and thinkers who need instant answers, immaculate UI vibes, and zero latency. Powered by **Groq Cloud (Llama 3.3 70B)**, **Google Gemini 1.5 Flash**, and **OpenAI**.

---

## 🌐 Live Demo & DNS Architecture

> 🔗 **Live URL:** [https://moni-sigmagpt.duckdns.org](https://moni-sigmagpt.duckdns.org)

### How the Deployment & DNS Works:

```mermaid
graph LR
    User["🌐 User / Browser"] -->|"1. Requests moni-sigmagpt.duckdns.org"| DNS["DuckDNS Server<br>(Resolves to EC2 Public IP)"]
    DNS -->|"2. Directs to EC2"| EC2["AWS EC2 Instance<br>(Ports 80 & 443)"]
    
    subgraph EC2_Server["Inside AWS EC2"]
        Nginx["Nginx Web Server<br>• SSL Termination (Let's Encrypt)<br>• Port 80 -> 443 Redirect"]
        Frontend["Frontend SPA<br>(Vite Production Build)"]
        Backend["Backend API (PM2)<br>(Express on :8080)"]
        
        Nginx -->|"Static files (/)"| Frontend
        Nginx -->|"Proxy (/api/*)"| Backend
    end

    Backend -->|"Database queries"| Atlas[("MongoDB Atlas")]
    Backend -->|"AI Inference"| LLMs["Groq Cloud / Gemini / OpenAI"]
```

1. **Dynamic DNS (DuckDNS)**:
   - Maps the custom domain `moni-sigmagpt.duckdns.org` directly to the AWS EC2 instance's Elastic/Public IP address.
2. **Nginx Reverse Proxy & SSL (Certbot / Let's Encrypt)**:
   - Listens on ports `80` (HTTP) and `443` (HTTPS with TLS encryption).
   - Port 80 automatically issues a `301 Redirect` to secure `https://`.
   - Directly serves the optimized React static build files for the web interface.
   - Forwards all `/api/*` REST endpoints internally to `http://127.0.0.1:8080`.
3. **PM2 Process Manager**:
   - Manages the Node.js backend daemon in the background with auto-restart on system reboots or unhandled errors.

## 💎 The Vibe Check (Features)

- ⚡ **Multi-Brain AI Switching**: Swap models mid-convo without losing your flow:
  - 🧠 **SigmaGPT 4o-mini** — Balanced, witty, and smart.
  - 🏎️ **Llama 3.3 70B (Meta via Groq)** — Insane speed, deep reasoning, zero waiting.
  - 💻 **Qwen 2.5 32B (Alibaba)** — God-tier for coding, math, and syntax debugging.
  - ⚡ **Gemini 1.5 Flash (Google)** — Ultra-fast, sharp, concise responses.
- 🎙️ **Voice Mode (Hands-Free)**:
  - 🎤 **Speak Your Mind**: Live Speech-to-Text with glowing mic animation.
  - 🔊 **Read Aloud**: Natural speech playback for any AI response.
  - 📋 **One-Tap Copy**: Snag code blocks and markdown answers instantly.
- 🔒 **Flex Your Auth (Guest Mode or SSO)**:
  - 👤 **Guest Mode**: Hop in and start cooking instantly — no login required.
  - 🌐 **1-Click Google & GitHub SSO**: Sync your chats across your phone, laptop, and PC.
  - 🛡️ **JWT Security & Password Hashing**: Your chat history is encrypted and isolated to you.
- ☀️🌙 **Aesthetic Dark & Light Themes**: Curated glassmorphism design system that stays easy on your eyes at 3 AM.
- 📊 **Flawless Markdown & Tables**: GFM tables that won't break on mobile screens, plus syntax-highlighted code blocks with Atom One Dark.
- 📜 **Smart Scroll Tech**: Pauses auto-scroll when you scroll up so you can read without getting yanked down, plus a floating jump-to-bottom button (`↓`).
- 🗑️ **Safe Thread Management**: Clean collapsible sidebar with delete confirmation dialogs so you never nuke an important chat by accident.
- 🔄 **Automated CI/CD Pipeline**: GitHub Actions testing builds and syntax integrity on every single commit.

---

## 🛠️ The Tech Stack (Zero Bloat)

```text
┌─────────────────────────────────────────────────────────────┐
│                       THE FRONTEND                          │
│     React 19  •  Vite  •  Vanilla CSS (Design Tokens)       │
│  React-Markdown  •  Remark-GFM  •  Rehype-Highlight (Atom)  │
│        Web Speech API (Speech Recognition + TTS)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON via REST / HTTPS
┌──────────────────────────────▼──────────────────────────────┐
│                        THE BACKEND                          │
│       Node.js (ESM)  •  Express.js  •  JWT + Bcryptjs       │
│          Mongoose  •  MongoDB Atlas Database                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
          ⚡ Groq Cloud API           ✨ Google Gemini / OpenAI
     (Llama 3.3 70B & Qwen 2.5)          (1.5 Flash & 4o-mini)
```

---

## 🚀 Run It Locally (Quickstart in 2 Minutes)

### 1. Clone the Repo
```bash
git clone https://github.com/moni-sm/sigma-gptt.git
cd sigma-gptt
```

### 2. Fire Up the Backend
```bash
cd Backend
npm install
```

Create your `Backend/.env` file:
```env
PORT=8080
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sigmagpt?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=gsk_your_free_groq_api_key
# GEMINI_API_KEY=your_gemini_api_key
```

Start the server:
```bash
node server.js
```
*Backend runs on `http://localhost:8080` (MongoDB connected ✅).*

### 3. Launch the Frontend
Open a new terminal tab:
```bash
cd Frontend
npm install
npm run dev
```
*Boom! Head over to **http://localhost:5173** and start chatting.*

---

## ☁️ Deploying to AWS EC2 (Production Setup)

Deploying with **Amazon Linux 2023 / Ubuntu**, **Nginx Reverse Proxy**, and **Let's Encrypt SSL**:

```bash
# 1. SSH into your EC2 instance & install dependencies
sudo dnf update -y
sudo dnf install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# 2. Clone and start Backend with PM2
cd /home/ec2-user
git clone https://github.com/moni-sm/sigma-gptt.git
cd sigma-gptt/Backend
npm install
pm2 start server.js --name "sigmagpt-backend"
pm2 save
pm2 startup

# 3. Build the Frontend bundle
cd ../Frontend
npm install
npm run build

# 4. Apply Nginx config & reload
sudo cp /home/ec2-user/sigma-gptt/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx

# 5. Free SSL Certificate with DuckDNS & Certbot
sudo certbot --nginx -d moni-sigmagpt.duckdns.org
```

---

## 🔄 Automated CI/CD Pipeline (Continuous Deployment)

SigmaGPT uses GitHub Actions for continuous integration and automated deployment directly to AWS EC2 upon pushing or merging into `main`.

```mermaid
graph LR
    Push["🚀 Push to main"] --> CI["🧪 Run CI Tests<br>(Backend Syntax + Frontend Build)"]
    CI -->|Pass| CD["⚡ Automated CD<br>(SSH to AWS EC2)"]
    CD --> Pull["📥 Git Pull & Reset"]
    Pull --> Backend["⚙️ npm ci & pm2 reload"]
    Backend --> Frontend["🎨 npm run build (Vite)"]
    Frontend --> Nginx["🌐 Reload Nginx"]
    Nginx --> Health["🩺 Health Check Passed ✅"]
```

### GitHub Secrets Required for CD

To enable automatic deployment, add these repository secrets under **Settings > Secrets and variables > Actions**:

| Secret Name | Description | Example / Value |
|---|---|---|
| `EC2_HOST` | DuckDNS domain or Public IP of EC2 | `moni-sigmagpt.duckdns.org` |
| `EC2_USER` | EC2 SSH Username | `ec2-user` |
| `EC2_SSH_KEY` | Private SSH Key (`.pem` file content) | `-----BEGIN RSA PRIVATE KEY----- ...` |
| `EC2_PORT` *(Optional)* | Custom SSH Port | `22` (default) |

---

## 📡 API Cheat Sheet

| HTTP | Route | What it does | Auth Required? |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new user with email & password | ❌ No |
| `POST` | `/api/auth/login` | Login and receive a 7-day JWT token | ❌ No |
| `POST` | `/api/auth/social-login` | 1-Click Google & GitHub SSO | ❌ No |
| `GET` | `/api/auth/me` | Fetch active user profile | 🔒 Yes (`Bearer <token>`) |
| `POST` | `/api/chat` | Send prompt & stream AI completion | ⚡ Optional (Guest supported) |
| `GET` | `/api/thread` | Fetch user conversation history | ⚡ Optional |
| `GET` | `/api/thread/:id` | Fetch specific thread messages | ⚡ Optional |
| `DELETE` | `/api/thread/:id` | Delete conversation thread | ⚡ Optional |
| `GET` | `/api/health` | Backend & Database health check | ❌ No |

---

## 📂 Clean Project Structure

```text
sigma-gptt/
├── .github/workflows/ci.yml    # Automated CI/CD build tests
├── Backend/
│   ├── middleware/auth.js      # JWT verification & optional auth
│   ├── models/
│   │   ├── Thread.js           # Conversation schemas
│   │   └── User.js             # User credentials & profiles
│   ├── routes/
│   │   ├── auth.js             # Auth & Social login endpoints
│   │   └── chat.js             # Chat generation & thread routes
│   ├── utils/openai.js         # Multi-LLM provider router
│   ├── server.js               # Express entrypoint
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── api.js              # Universal API endpoint resolver
│   │   ├── App.jsx             # State provider & root layout
│   │   ├── AuthModal.jsx       # SSO & email login modal
│   │   ├── Chat.jsx            # Feed, speech player & markdown
│   │   ├── ChatWindow.jsx      # Model switcher & mic dock
│   │   ├── Sidebar.jsx         # Chat history & user profile
│   │   └── index.css           # Design tokens (Dark & Light)
│   ├── vite.config.js          # Vite config & proxy
│   └── package.json
├── nginx.conf                  # Production reverse proxy config
├── LICENSE                     # MIT License
└── README.md                   # You are here ✨
```

---

## 🤝 Contributing

Got an idea or want to add a feature? PRs are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/CoolFeature`)
3. Commit your Changes (`git commit -m 'feat: add some cool feature'`)
4. Push to the Branch (`git push origin feature/CoolFeature`)
5. Open a Pull Request

---

## 📜 License

Copyright © 2026 [moni-sm](https://github.com/moni-sm). All rights reserved.

Distributed under the [MIT License](LICENSE). Drop a ⭐ if you vibe with this project!
