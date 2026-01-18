// clearTasks.js
const openDb = require('./db');

async function clearTasks() {
    const db = await openDb();
    await db.run('DELETE FROM Task_Definitions');
    console.log('✅ Tüm görevler başarıyla silindi.');
}

clearTasks();