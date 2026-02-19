import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SetupPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentLogin } = useAuth();
  const [formData, setFormData] = useState({
    rollNumber: location.state?.rollNumber || '',
    temporaryPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await api.post('/auth/student/setup-password', {
        rollNumber: formData.rollNumber,
        temporaryPassword: formData.temporaryPassword,
        newPassword: formData.newPassword
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Password set successfully!');
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error setting password';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Setup Your Password</h2>
        <p className="text-gray-600 text-sm mb-4 text-center">
          For first-time login, use your <strong>roll number</strong> as the temporary password.
        </p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Roll Number</label>
            <input
              type="text"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Temporary Password</label>
            <input
              type="password"
              placeholder="Use your roll number for first-time setup"
              value={formData.temporaryPassword}
              onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <p className="text-xs text-gray-500 mt-1">For first-time: Enter your roll number</p>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your new password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Set Password
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have a password?{' '}
            <button
              type="button"
              onClick={() => navigate('/student-login')}
              className="text-blue-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

