# 🐔 PoultryDex Server (REST API Backend)

> High-performance RESTful API service powering the PoultryDex Poultry Farm Management SaaS Platform.

---

## 🏗 Architecture & Tech Stack

- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose
- **Validation**: Zod schema validation
- **Authentication**: JWT & bcryptjs password hashing
- **Deployment**: Compatible with Docker, VPS/Cloud servers, and Vercel Serverless

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (local daemon or MongoDB Atlas cloud connection)

### Installation

```bash
# Clone the repository
git clone https://github.com/Utsho11/poultryDex-server.git
cd poultryDex-server

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build
```

### Running Locally

```bash
# Start development server with auto-reload
npm run dev

# Start compiled production server
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/poultrydex
JWT_SECRET=poultrydex_super_secret_jwt_key_2026
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,https://poultrydex.vercel.app
```

---

## 🧪 Testing & Database Seeding

```bash
# Seed initial test data
npm run seed

# Run automated diagnostic API test suite
npm test
```
