<div align="center">

<img src="https://img.shields.io/badge/🗺️%20Smart%20Tourist-Saarthi-FF6B35?style=for-the-badge" alt="Smart Tourist Saarthi"/>

# Smart Tourist Saarthi

### *Intelligent Tourist Safety & Assistance Platform*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Mobile%20App-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br/>

> **Smart Tourist Saarthi** is a full-stack tourist safety platform that combines real-time emergency communication, secure authentication, and a cross-platform mobile app — designed to protect and empower travelers across India.

</div>

---

## 📋 Table of Contents

- [📌 Problem Statement](#-problem-statement)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [⚡ Getting Started](#-getting-started)
- [🔧 Environment Variables](#-environment-variables)
- [📡 API Endpoints](#-api-endpoints)
- [📸 Screenshots](#-screenshots)
- [🔒 Security](#-security)
- [🚀 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 📌 Problem Statement

Tourists often face safety issues, difficulty accessing emergency services, and a lack of trusted local guidance while traveling. **Smart Tourist Saarthi** addresses this by providing a secure and intelligent platform that improves tourist safety, enables rapid emergency response, and offers travel assistance using modern web and mobile technologies.

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🛡️ Tourist Safety
- Emergency SOS alert system
- Real-time location tracking
- Incident reporting system
- Tourist authentication
- Nearby safety assistance

</td>
<td width="50%" valign="top">

### 📡 Real-Time Communication
- Live notifications via Socket.io
- Real-time emergency updates
- Instant alert broadcasting
- Multi-user event streaming

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📱 Mobile Application
- Cross-platform React Native app
- GPS & map integration
- User-friendly interface
- Mobile authentication system

</td>
<td width="50%" valign="top">

### 🔐 Security & Auth
- JWT-based authentication
- bcryptjs password hashing
- Input validation & sanitization
- Rate limiting & secure routes

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 18+ | Server-side JavaScript |
| **Framework** | Express.js 4.18 | REST API & middleware |
| **Database** | MongoDB + Mongoose | Primary data store |
| **Real-Time** | Socket.io | WebSocket communication |
| **Auth** | JWT + bcryptjs | Secure login system |
| **Mobile** | React Native | iOS & Android app |
| **Validation** | express-validator | Input sanitization |
| **Security** | Helmet + rate-limit | API hardening |
| **Testing** | Jest + Supertest + k6 | Unit, API & load tests |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│        React Native Mobile App       │
└──────────────────┬───────────────────┘
                   │ REST API / WebSocket
┌──────────────────▼───────────────────┐
│       Node.js + Express Backend      │
│  ┌──────────┐  ┌───────────────────┐ │
│  │ Auth/JWT │  │   Socket.io Server│ │
│  └──────────┘  └───────────────────┘ │
└───────────┬──────────────────────────┘
            │
┌───────────▼──────────────────────────┐
│           MongoDB Database           │
└──────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Smart-tourist-Saarthi-/
│
├── 📂 src/                         # Backend source code
│   ├── server.js                   # Entry point
│   ├── 📂 routes/                  # API route definitions
│   ├── 📂 controllers/             # Request handlers
│   ├── 📂 models/                  # Mongoose data models
│   ├── 📂 middleware/              # Auth, validation, errors
│   └── 📂 utils/
│       └── 📂 seeders/             # Database seeders
│
├── 📂 mobile app/
│   └── smart-tourist-app-main/     # React Native mobile app
│
├── 📂 public/                      # Static frontend assets
├── 📂 images/                      # App screenshots
├── 📂 docs/                        # Documentation
├── 📂 test/                        # Test suites
│   ├── test_backend_apis.js
│   ├── verify_database.js
│   └── load_test.js
│
├── .env                            # Environment variables
├── package.json
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) ≥ 18.x
- [MongoDB](https://www.mongodb.com/try/download/community) (local or Atlas)
- npm ≥ 9.x

### 1. Clone the Repository

```bash
git clone https://github.com/Shivam-avish235/Smart-tourist-Saarthi-.git
cd Smart-tourist-Saarthi-
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Mobile App Dependencies

```bash
cd "mobile app/smart-tourist-app-main"
npm install
```

### 4. Seed the Database *(optional)*

```bash
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
```

> Server runs at **http://localhost:5000**

### 6. Run the Mobile App

```bash
cd "mobile app/smart-tourist-app-main"

# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/smart_tourist

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
FRONTEND_URL=http://localhost:3000

# Optional blockchain KYC integration
ETHEREUM_RPC_URL=https://your-ethereum-rpc-endpoint
KYC_CONTRACT_ADDRESS=0xYourContractAddress
ADMIN_PRIVATE_KEY=your_private_key
```

`ETHEREUM_RPC_URL` must be a valid `http(s)://` or `ws(s)://` URL. A literal `placeholder` value will fail during provider initialization.

> ⚠️ **Never commit your `.env` file to version control.**

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login & receive JWT token |
| `POST` | `/api/auth/logout` | Invalidate session |

### Tourist Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tourists` | Get all tourists |
| `GET` | `/api/tourists/:id` | Get tourist by ID |
| `PUT` | `/api/tourists/:id` | Update tourist profile |
| `POST` | `/api/incidents` | Report an incident |
| `GET` | `/api/incidents` | View all incidents |

---

## 📸 Screenshots

### 🔑 Login Screen
![Login Screen](https://github.com/Shivam-avish235/Smart-tourist-Saarthi-/blob/main/images/img1.jpg)

---

### 📊 Tourist Dashboard
![Home Screen](https://github.com/Shivam-avish235/Smart-tourist-Saarthi-/blob/main/images/img2.jpg)

---

### 🆘 Emergency SOS
![Emergency SOS](https://github.com/Shivam-avish235/Smart-tourist-Saarthi-/blob/main/images/img4.jpg)

---

### 🏠 Home Screen
![Tourist Dashboard](https://github.com/Shivam-avish235/Smart-tourist-Saarthi-/blob/main/images/img5.jpg)

---

### 🗺️ Map & Tracking
![Map and Tracking](https://github.com/Shivam-avish235/Smart-tourist-Saarthi-/blob/main/images/img6.png)

---

## 🔒 Security

- **JWT Authentication** — Stateless, signed tokens for session management
- **bcryptjs** — Industry-standard password hashing
- **Helmet.js** — HTTP security headers (XSS, CSRF, clickjacking protection)
- **Rate Limiting** — Prevents brute-force and DDoS attacks
- **Input Validation** — `express-validator` sanitizes all user inputs
- **Secure API Routes** — Protected endpoints with middleware guards

---

## 🚀 Future Enhancements

- 🤖 AI-based tourist assistant chatbot
- 🎙️ Voice-triggered SOS system
- 📶 Offline emergency mode
- 🌐 Multi-language support (Hindi, English, regional)
- 🧠 Smart travel recommendations engine
- 🔗 Blockchain KYC for verified guides

---

## 🌐 Deployment

| Layer | Recommended Platform |
|-------|---------------------|
| Backend | [Render](https://render.com) / [Railway](https://railway.app) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Mobile App | Expo / APK Release / Play Store |

```bash
# Production start
npm start
```

---

## 🧪 Testing

```bash
# Unit tests (Jest)
npm test

# API integration tests
npm run test:api

# Database verification
npm run test:db

# Load tests (requires k6)
npm run test:load
```

---

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repository
2. **Create** your feature branch — `git checkout -b feature/AmazingFeature`
3. **Commit** your changes — `git commit -m 'Add AmazingFeature'`
4. **Push** to the branch — `git push origin feature/AmazingFeature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Smart Tourist Saarthi

Built with ❤️ using Node.js & React Native

**Developed by [Shivam Verma](https://github.com/Shivam-avish235)**

*If you found this helpful, please consider giving it a star!*

[![GitHub stars](https://img.shields.io/github/stars/Shivam-avish235/Smart-tourist-Saarthi-?style=social)](https://github.com/Shivam-avish235/Smart-tourist-Saarthi-)

</div>
