# WhatsApp Web Pro - Live Atlas Chat 🚀

A full-stack, real-time messaging application inspired by WhatsApp Web. Built to demonstrate proficiency with WebSockets, real-time database updates, and responsive frontend UI design.

## ✨ Key Features

* **Real-Time Messaging:** Instant message delivery using `Socket.io` without page reloads.
* **Private & Group Chats:** Users can chat in a global public room or initiate 1-on-1 private conversations.
* **User Authentication:** Secure signup/login system with hashed passwords (`bcryptjs`) and persistent browser sessions via `localStorage`.
* **Image Sharing:** Attach and send images seamlessly (converted to Base64 and stored securely in the database).
* **Advanced Deletion Logic:**
    * *Delete for Everyone:* Completely wipes the message and image data from the MongoDB database for all users.
    * *Delete for Me:* Hides the message locally from the user's view while retaining it for the recipient.
* **Smart Socket Management:** Prevents duplicate user rendering when multiple browser tabs are open.
* **Modern UI/UX:** Clean, responsive interface styled with Tailwind CSS, featuring active status indicators, hover menus, and an intuitive "empty state" landing view.

## 🛠️ Tech Stack

**Frontend:**
* HTML5 / CSS3
* Vanilla JavaScript
* Tailwind CSS (via CDN)
* FontAwesome (Icons)
* DiceBear API (Dynamic Avatars)

**Backend:**
* Node.js
* Express.js
* Socket.io (Real-time bidirectional communication)
* MongoDB Atlas (Cloud Database)
* Mongoose (Object Data Modeling)
* Bcrypt.js (Password encryption)

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### 2. Clone the repository
```bash
git clone [https://github.com/h-i-m-a-n-s-h-u95/live-atlas-chat.git](https://github.com/h-i-m-a-n-s-h-u95/live-atlas-chat.git)
cd live-atlas-chat
