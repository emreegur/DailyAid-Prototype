import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ElderlyDashboard() {
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Chatbot State'leri
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const navigate = useNavigate();
  
  const userName = localStorage.getItem('user_name') || 'Dear Elder';
  const userId = localStorage.getItem('user_id');

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const taskRes = await axios.get(`http://localhost:3000/api/tasks/${userId}`);
      setTasks(taskRes.data);
      const reqRes = await axios.get(`http://localhost:3000/api/elder/requests/${userId}`);
      setRequests(reqRes.data);
    } catch (error) {
      console.error("Data could not be fetched:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    fetchData();
    // Chatbot açılış mesajı
    setMessages([{ role: 'ai', text: `Hello ${userName}! How can I help you today?` }]);
  }, [userId, navigate, fetchData, userName]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    // Kullanıcı mesajını ekle
    const userMsg = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/api/chat', { 
        message: chatInput,
        userName: userName
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Can't connect right now." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await axios.put(`http://localhost:3000/api/tasks/${taskId}/complete`);
      fetchData(); 
    } catch (error) {
      alert("An error occurred, please try again.");
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      await axios.post('http://localhost:3000/api/elder/respond', { request_id: requestId, status });
      fetchData();
    } catch (error) {
      alert("Action could not be performed.");
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="p-6 bg-yellow-50 min-h-screen">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-5xl font-black text-orange-800 text-center md:text-left">
          👴 Hello, {userName}
        </h1>
        <div className="flex gap-4">
          <button onClick={fetchData} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-2xl font-bold shadow-lg active:scale-95 transition">
            🔄 Refresh
          </button>
          <button onClick={handleLogout} className="bg-red-600 text-white px-8 py-4 rounded-2xl text-2xl font-bold shadow-lg active:scale-95 transition">
            Logout
          </button>
        </div>
      </div>
      
      {/* CONNECTION REQUESTS */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-red-400 mb-10">
          <h2 className="text-4xl font-black text-red-600 mb-6">🔔 Connection Requests</h2>
          
          {requests.length === 0 ? (
            <p className="text-3xl text-gray-500 italic">No new requests at the moment.</p>
          ) : (
            requests.map(req => (
              <div key={req.id} className="flex flex-col sm:flex-row justify-between items-center bg-red-50 p-6 rounded-2xl mb-4 border-2 border-red-100 gap-4">
                <span className="text-3xl text-gray-800">
                  <strong>{req.first_name} {req.last_name}</strong> wants to follow you.
                </span>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button onClick={() => handleRespond(req.id, 'Accepted')} className="bg-green-600 text-white px-10 py-4 rounded-xl text-2xl font-bold flex-1">Yes, Approve</button>
                  <button onClick={() => handleRespond(req.id, 'Rejected')} className="bg-gray-500 text-white px-10 py-4 rounded-xl text-2xl font-bold flex-1">No</button>
                </div>
              </div>
            ))
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* TASK LIST */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-orange-200">
          <h2 className="text-4xl font-black mb-8 text-gray-800 border-b-4 border-orange-100 pb-4">📅 What's on for Today?</h2>
          
          {loading ? (
            <p className="text-3xl text-gray-400 animate-bounce">Loading...</p>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
                <p className="text-5xl mb-4">🎉</p>
                <p className="text-3xl text-green-600 font-bold">Great! All tasks are done.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {tasks.map((task) => (
                <li key={task.task_id} className="p-8 bg-gray-50 rounded-3xl border-2 border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-6 hover:border-orange-400 transition">
                  <div className="text-center sm:text-left">
                    <span className="text-4xl font-bold block text-gray-800 mb-2">{task.title}</span>
                    <span className="text-2xl text-orange-600 font-semibold bg-orange-50 px-4 py-1 rounded-full">⏰ Time: {task.scheduled_time}</span>
                  </div>
                  <button 
                    onClick={() => handleComplete(task.task_id)} 
                    className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 rounded-3xl text-3xl font-black shadow-2xl transform transition active:scale-90 w-full sm:w-auto"
                  >
                      DONE ✅
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CHATBOT (GÜNCELLENDİ) */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-blue-200 flex flex-col h-[600px]">
          <h2 className="text-4xl font-black mb-6 text-blue-600">🤖 Chat Bot</h2>
          
          <div className="flex-1 bg-gray-50 rounded-2xl mb-6 p-6 overflow-y-auto border-2 border-inner flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-5 rounded-2xl max-w-[85%] text-2xl shadow-md ${
                  msg.role === 'user' 
                  ? 'bg-orange-500 text-white rounded-br-none' 
                  : 'bg-blue-600 text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && <p className="text-gray-400 italic text-xl ml-2">Thinking...</p>}
          </div>

          <div className="flex gap-4">
            <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                type="text" 
                placeholder="Type here..." 
                className="flex-1 border-4 border-gray-200 p-6 rounded-2xl text-2xl focus:border-blue-500 outline-none" 
            />
            <button 
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-2xl font-bold shadow-lg active:scale-95 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}