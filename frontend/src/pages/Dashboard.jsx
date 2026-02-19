import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!stats) return <div>Error loading dashboard</div>;

  // Student view - show their own data
  if (user?.role === 'student') {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-600">Welcome, {user.name}!</p>
          <p className="mt-2">View your detailed profile and performance:</p>
          <button
            onClick={() => navigate(`/students/${user.id}`)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View My Profile
          </button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Total Students', value: stats.totalStudents },
    { name: 'Present Today', value: stats.presentToday },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Total Students</h3>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
          {user?.role === 'admin' && stats.pendingStudents > 0 && (
            <p className="text-sm text-yellow-600 mt-1">{stats.pendingStudents} pending</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Today's Attendance</h3>
          <p className="text-3xl font-bold">{stats.presentToday}/{stats.totalToday}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalToday > 0 ? ((stats.presentToday / stats.totalToday) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Pass Percentage</h3>
          <p className="text-3xl font-bold">{stats.passPercentage}%</p>
          <p className="text-sm text-gray-500 mt-1">Based on 50% threshold</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Top Performers</h3>
          <p className="text-3xl font-bold">{stats.topPerformers.length}</p>
          <p className="text-sm text-gray-500 mt-1">Students</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Weekly Attendance Trend */}
        {stats.weeklyAttendance && stats.weeklyAttendance.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Weekly Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Class-wise Attendance */}
        {stats.classAttendance && stats.classAttendance.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Today's Attendance by Class</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.classAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="total" fill="#3b82f6" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Performers */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Top Performers</h2>
        {stats.topPerformers.length === 0 ? (
          <p className="text-gray-500">No performance data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Roll Number</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Average</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPerformers.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">#{idx + 1}</td>
                    <td 
                      className="px-4 py-2 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/students/${item.student._id}`)}
                    >
                      {item.student.name}
                    </td>
                    <td className="px-4 py-2">{item.student.rollNumber}</td>
                    <td className="px-4 py-2">{item.student.class}</td>
                    <td className="px-4 py-2 font-semibold">{item.average}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Students */}
      {user?.role === 'admin' && stats.recentStudents && stats.recentStudents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recently Approved Students</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Roll Number</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Approved Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentStudents.map((student, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td 
                      className="px-4 py-2 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/students/${student._id}`)}
                    >
                      {student.name}
                    </td>
                    <td className="px-4 py-2">{student.rollNumber}</td>
                    <td className="px-4 py-2">{student.class}</td>
                    <td className="px-4 py-2">
                      {student.approvedAt ? new Date(student.approvedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
