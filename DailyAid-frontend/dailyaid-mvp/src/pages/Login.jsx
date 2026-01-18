import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // We will make API requests with Axios

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // 1. Send POST request to backend (with Email and Password)
      const response = await axios.post('http://localhost:3000/api/login', {
        email: email,
        password: password
      });

      const data = response.data;

      // 2. If Login is Successful
      if (data.success) {
        console.log("Login Successful:", data);

        // Save user info to browser storage (localStorage)
        // This helps us track "Who is logged in?" on other pages.
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_name', data.name);

        // 3. Redirect based on Role
        if (data.role === 'family') {
          navigate('/family-dashboard');
        } else {
          navigate('/elderly-dashboard');
        }
      }

    } catch (err) {
      // If backend returns an error (401 etc.) or server is down
      const errorMsg = err.response?.data?.message || 'Could not connect to the server!';
      setError(errorMsg);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">DailyAid Login</h2>
        
        {/* Error Message Box */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            placeholder="parent@test.com"
            className="w-full p-2 border rounded focus:outline-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            placeholder="Your password (123456)"
            className="w-full p-2 border rounded focus:outline-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200">
          Login
        </button>
      </form>
    </div>
  );
}