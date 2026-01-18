import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FamilyDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name');
  const familyId = localStorage.getItem('user_id');

  // Form Data
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [elderId, setElderId] = useState('2'); // Grandpa Mehmet ID (Fixed for testing)
  
  // Notifications and Data
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [newElderEmail, setNewElderEmail] = useState('');

  // Fetch Dashboard Data (Notifications and History)
  const fetchDashboardData = async () => {
    try {
      // 1. Notifications
      const notifRes = await axios.get(`http://localhost:3000/api/family/notifications/${familyId}`);
      setNotifications(notifRes.data.completedTasks);

      // 2. Selected Elder's History
      const histRes = await axios.get(`http://localhost:3000/api/family/history/${familyId}/${elderId}`);
      setHistory(histRes.data);
    } catch (error) {
      console.error("Data error", error);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [familyId, elderId]);

  // ASSIGN TASK
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/tasks', {
        creator_family_id: familyId,
        assigned_elder_id: elderId,
        title: taskTitle,
        scheduled_time: taskTime
      });
      setMessage('✅ Task sent successfully!');
      setTaskTitle(''); setTaskTime(''); setTimeout(() => setMessage(''), 3000);
      fetchDashboardData();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || "An error occurred"}`);
    }
  };

  // SEND CONNECTION REQUEST
  const handleAddElder = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/connect', {
        family_id: familyId,
        elder_email: newElderEmail
      });
      alert(res.data.message);
      setNewElderEmail('');
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Error"}`);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="p-8 min-h-screen bg-green-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">👨‍👩‍👧 Family Dashboard: {userName}</h1>
        <div className="flex gap-2">
           <button onClick={fetchDashboardData} className="bg-blue-500 text-white px-4 py-2 rounded">🔄 Refresh</button>
           <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIONS */}
        <div className="space-y-6">
            {/* Add Task */}
            <div className="bg-white p-6 rounded shadow border border-green-200">
            <h2 className="text-xl font-bold mb-4 text-green-700">+ Assign New Task</h2>
            {message && <div className={`p-2 mb-4 rounded text-white ${message.includes('✅') ? 'bg-green-500' : 'bg-red-500'}`}>{message}</div>}
            <form onSubmit={handleAddTask}>
                <input type="text" placeholder="e.g., Take medication" className="border p-2 w-full rounded mb-2" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                <input type="time" className="border p-2 w-full rounded mb-2" value={taskTime} onChange={e => setTaskTime(e.target.value)} required />
                <select className="border p-2 w-full rounded bg-gray-50 mb-4" value={elderId} onChange={e => setElderId(e.target.value)}>
                    <option value="2">Grandpa Mehmet (Test)</option>
                </select>
                <button className="bg-green-600 text-white w-full py-2 rounded font-bold">Send Task</button>
            </form>
            </div>

            {/* Add Elder Connection */}
            <div className="bg-white p-6 rounded shadow border border-gray-200">
                <h2 className="text-lg font-bold mb-2">👴 New Connection</h2>
                <form onSubmit={handleAddElder}>
                    <input type="email" placeholder="elderly@email.com" className="border p-2 w-full mb-2 rounded" value={newElderEmail} onChange={e => setNewElderEmail(e.target.value)} required />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">Send Request</button>
                </form>
            </div>
        </div>

        {/* MIDDLE COLUMN: NOTIFICATIONS */}
        <div className="bg-white p-6 rounded shadow border h-fit">
          <h2 className="text-xl font-bold mb-4 text-purple-700">🔔 Recent Activities</h2>
          {notifications.length === 0 ? <p className="text-gray-500">No recent activity yet.</p> : (
            <ul className="space-y-3">
              {notifications.map((notif, i) => (
                <li key={i} className="p-3 bg-purple-50 rounded border border-purple-100 text-sm">
                  <strong>{notif.first_name}</strong> completed the task: "{notif.title}".
                  <div className="text-gray-400 text-xs mt-1">{new Date(notif.completed_at).toLocaleTimeString('en-US')}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div className="bg-white p-6 rounded shadow border h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-700">📜 Completed Tasks</h2>
          {history.length === 0 ? <p className="text-gray-500">No completed tasks yet.</p> : (
            <ul className="space-y-2">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between p-2 border-b text-sm">
                  <span>{h.title}</span>
                  <span className="text-green-600 font-bold">✓</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}