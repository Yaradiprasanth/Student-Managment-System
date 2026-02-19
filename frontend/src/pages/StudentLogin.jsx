import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function StudentLogin() {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { studentLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/student-login', { rollNumber, password });
      
      // If password needs setup, redirect to setup page
      if (res.data.needsPasswordSetup) {
        navigate('/setup-password', { 
          state: { rollNumber: res.data.rollNumber } 
        });
        toast.info('Please set up your password');
        return;
      }
      
      await studentLogin(rollNumber, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      
      // If password not set, show helpful message
      if (errorMsg.includes('Password not set') || errorMsg.includes('temporary password')) {
        toast.error('Use your roll number as password to set up your account', {
          duration: 5000
        });
      } else {
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Login</h2>
        
        {/* Info Box for First-Time Users */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>First time logging in?</strong><br />
            Use your <strong>roll number</strong> as both roll number and password to set up your account.
          </p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Roll Number</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Use roll number if first time"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              First time? Enter your roll number here
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Admin/Teacher?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline"
            >
              Login here
            </button>
          </p>
          <p className="text-center text-sm text-gray-600 mt-2">
            New student?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline"
            >
              Register here
            </button>
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-600 text-center">
              <strong>Need help?</strong><br />
              First-time users: Use roll number as password<br />
              Forgot password? Contact admin to reset
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

