# Live Atlas Chat 💬

A real-time WhatsApp-style chat app built with **Node.js**, **Express**, **Socket.io**, and **MongoDB Atlas**. Supports group chat, private messaging, image sharing, and message deletion — all backed by a live database.

🔗 **Live Demo:** [https://live-atlas-chat.onrender.com](https://live-atlas-chat.onrender.com)

---

## ✨ Features

- 🔐 User signup & login with hashed passwords (bcrypt)
- 💬 Public group chat room
- 📩 Private one-on-one messaging
- 🖼️ Image sharing in chat
- 🗑️ Delete messages for yourself or for everyone
- 🟢 Real-time online user list
- 📦 Persistent chat history stored in MongoDB Atlas

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB Atlas (via Mongoose)
- **Frontend:** HTML, Tailwind CSS, vanilla JavaScript
- **Auth:** bcryptjs for password hashing

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and connection string

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/h-i-m-a-n-s-h-u95/live-atlas-chat.git
   cd live-atlas-chat
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. Start the server
   ```bash
   node index.js
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

This project is deployed on [Render](https://render.com) as a Node.js web service.

- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Environment Variables:** `MONGO_URI`, `PORT`

Note: MongoDB Atlas Network Access must allow connections from `0.0.0.0/0` since Render's outbound IPs aren't fixed.

## 📄 License

This project is open source and available for personal/educational use.
