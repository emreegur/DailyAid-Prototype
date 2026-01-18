require('dotenv').config(); // 1. EKLENDİ
const express = require('express');
const cors = require('cors');
const openDb = require('./db');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 2. EKLENDİ

const app = express();
app.use(cors());
app.use(express.json());

// GEMINI AYARI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. LOGIN ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = await openDb();
        const user = await db.get('SELECT * FROM Users WHERE email = ? AND password_hash = ?', [email, password]);
        
        if (!user) return res.status(401).json({ success: false, message: 'Hatalı e-posta veya şifre!' });

        let profileName = "Kullanıcı";
        if (user.role === 'family') {
            const fam = await db.get('SELECT first_name FROM Family_Profiles WHERE user_id = ?', [user.user_id]);
            if(fam) profileName = fam.first_name;
        } else {
            const eld = await db.get('SELECT first_name FROM Elderly_Profiles WHERE user_id = ?', [user.user_id]);
            if(eld) profileName = eld.first_name;
        }

        res.json({ success: true, role: user.role, user_id: user.user_id, name: profileName });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 2. GÖREV İŞLEMLERİ ---
app.get('/api/tasks/:elderId', async (req, res) => {
    try {
        const db = await openDb();
        const tasks = await db.all(`
            SELECT * FROM Task_Definitions 
            WHERE assigned_elder_id = ? 
            AND status = 'Pending' 
            ORDER BY scheduled_time ASC
        `, [req.params.elderId]);
        res.json(tasks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/tasks/:taskId/complete', async (req, res) => {
    try {
        const db = await openDb();
        await db.run(
            `UPDATE Task_Definitions SET status = 'Completed', completed_at = DATETIME('now', 'localtime') WHERE task_id = ?`,
            [req.params.taskId]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tasks', async (req, res) => {
    const { creator_family_id, assigned_elder_id, title, scheduled_time } = req.body;
    try {
        const db = await openDb();
        const connection = await db.get(
            `SELECT * FROM Monitors WHERE family_id = ? AND elder_id = ? AND status = 'Accepted'`,
            [creator_family_id, assigned_elder_id]
        );

        if (!connection) {
            return res.status(403).json({ error: "Yaşlı henüz isteği kabul etmedi." });
        }

        const result = await db.run(
            'INSERT INTO Task_Definitions (creator_family_id, assigned_elder_id, title, scheduled_time) VALUES (?, ?, ?, ?)',
            [creator_family_id, assigned_elder_id, title, scheduled_time]
        );
        res.json({ success: true, id: result.lastID });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 3. BAĞLANTI İŞLEMLERİ ---
app.post('/api/connect', async (req, res) => {
    let { family_id, elder_email } = req.body;
    family_id = Number(family_id);

    try {
        const db = await openDb();
        const elderUser = await db.get(`SELECT user_id FROM Users WHERE email = ? AND role = 'elderly'`, [elder_email]);
        
        if (!elderUser) return res.status(404).json({ message: "Yaşlı bulunamadı." });

        const elder_id = elderUser.user_id;
        const existing = await db.get(`SELECT status FROM Monitors WHERE family_id = ? AND elder_id = ?`, [family_id, elder_id]);
        
        if (existing) {
            if (existing.status === 'Accepted') return res.status(400).json({ message: "Zaten bağlısınız." });
            if (existing.status === 'Pending') return res.status(400).json({ message: "İstek beklemede." });
            
            if (existing.status === 'Rejected') {
                await db.run(`UPDATE Monitors SET status = 'Pending' WHERE family_id = ? AND elder_id = ?`, [family_id, elder_id]);
                return res.json({ success: true, message: "İstek tekrar gönderildi!" });
            }
        }

        await db.run(`INSERT INTO Monitors (family_id, elder_id) VALUES (?, ?)`, [family_id, elder_id]);
        res.json({ success: true, message: "İstek gönderildi!" });

    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/elder/requests/:elderId', async (req, res) => {
    try {
        const db = await openDb();
        const requests = await db.all(`
            SELECT m.id, m.family_id, f.first_name, f.last_name 
            FROM Monitors m
            JOIN Family_Profiles f ON m.family_id = f.user_id
            WHERE m.elder_id = ? AND m.status = 'Pending'
        `, [req.params.elderId]);
        res.json(requests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/elder/respond', async (req, res) => {
    const { request_id, status } = req.body; 
    try {
        const db = await openDb();
        await db.run(`UPDATE Monitors SET status = ? WHERE id = ?`, [status, request_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 4. BİLDİRİMLER VE GEÇMİŞ ---
app.get('/api/family/notifications/:familyId', async (req, res) => {
    try {
        const db = await openDb();
        const completedTasks = await db.all(`
            SELECT t.title, t.completed_at, e.first_name 
            FROM Task_Definitions t
            JOIN Elderly_Profiles e ON t.assigned_elder_id = e.user_id
            WHERE t.creator_family_id = ? AND t.status = 'Completed'
            ORDER BY t.completed_at DESC LIMIT 5
        `, [req.params.familyId]);

        res.json({ completedTasks });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/family/history/:familyId/:elderId', async (req, res) => {
    try {
        const db = await openDb();
        const history = await db.all(`
            SELECT title, scheduled_time, completed_at 
            FROM Task_Definitions
            WHERE creator_family_id = ? AND assigned_elder_id = ? AND status = 'Completed'
            ORDER BY completed_at DESC LIMIT 10
        `, [req.params.familyId, req.params.elderId]);
        res.json(history);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 5. CHATBOT API (EKLENDİ) ---
app.post('/api/chat', async (req, res) => {
    const { message, userName } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `You are a helpful and kind assistant for elderly people. Your name is DailyAid. 
        You are talking to ${userName}. Keep your answers short, clear, and encouraging. 
        User says: "${message}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ text: response.text() });
    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "I'm having trouble thinking right now." });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Backend yayında: http://localhost:${PORT}`));