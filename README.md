# DailyAid: AI-Powered Elderly Care Assistant (MVP) 👴❤️👵

DailyAid is a web-based application designed to bridge the gap between independent living for the elderly and peace of mind for their families. It combines a simple task management system with an AI-powered companion to support daily routines.

> **Status:** 🚧 Prototype / MVP (Minimum Viable Product)

---

## 🎯 Problem & Solution

### The Problem
Elderly individuals often struggle with complex technology, medication adherence, and social isolation, while families worry about their well-being from afar.

### The Solution
DailyAid provides two distinct interfaces:
1. **Family Dashboard** – Assign tasks (medication, exercise) and monitor progress.
2. **Elderly Dashboard** – A simplified, high-contrast interface for viewing tasks and chatting with an AI companion.

---

## 🚀 Key Features (Prototype)

- Role-based access for Family Members and Elderly Users  
- Task creation and completion tracking  
- Real-time logging with SQLite  
- AI-powered companion using Google Gemini  
- Task completion monitoring for families  

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** SQLite  
- **AI Integration:** Google Gemini API (`@google/generative-ai`)  

---

## 📂 Project Structure

/frontend   → React client application  
/backend    → Node.js server & SQLite database  

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (LTS)
- Google Gemini API Key

---

### Backend Setup

cd backend  
npm install  

Create a `.env` file in the backend directory:

PORT=3000  
GEMINI_API_KEY=your_actual_gemini_api_key_here  

Initialize database and start server:

node setup.js  
node server.js  

Backend runs on `http://localhost:3000`

---

### Frontend Setup

cd frontend  
npm install  
npm run dev  

Frontend runs on `http://localhost:5173`

---

## 🗺️ Roadmap & Future Plans

### Phase 2: Mobility, Accessibility & Security

- Mobile applications (iOS & Android)  
- Voice-based interaction (Speech-to-Text & Text-to-Speech)  
- Two-Factor Authentication (2FA) for secure pairing  
- Mood and mental health analysis via NLP  

---

## 👥 Team

- **[Emre Gur]** – Full Stack Developer & AI Engineer 
- **[Ergun Kaan Artan]** – Full Stack Developer & AI Engineer  

---

Developed for **[Senior Design Project]** – 2025
