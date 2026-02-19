import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'student' && user.id !== id) {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    fetchStudentData();
  }, [id, user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [studentRes, reportRes] = await Promise.all([
        api.get(`/students/${id}`),
        api.get(`/reports/student/${id}`)
      ]);
      
      setStudent(studentRes.data);
      setAttendance(reportRes.data.attendance || []);
      setMarks(reportRes.data.marks || []);
      setAttendanceStats({
        percentage: reportRes.data.attendancePercentage,
        averageMarks: reportRes.data.averageMarks,
        totalMarks: reportRes.data.totalMarks
      });
    } catch (err) {
      toast.error('Error fetching student data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = [
      ['Student Information'],
      ['Name', student.name],
      ['Roll Number', student.rollNumber],
      ['Email', student.email],
      ['Class', student.class],
      [],
      ['Attendance Records'],
      ['Date', 'Status'],
      ...attendance.map(a => [new Date(a.date).toLocaleDateString(), a.status]),
      [],
      ['Marks Records'],
      ['Date', 'Exam Type', 'Subject', 'Marks', 'Total Marks'],
      ...marks.map(m => [
        new Date(m.date).toLocaleDateString(),
        m.examType,
        m.subject,
        m.marks,
        m.totalMarks
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Report');
    XLSX.writeFile(wb, `${student.name}_Report.xlsx`);
    toast.success('Report exported successfully');
  };

  if (loading) return <Loading />;
  if (!student) return <div>Student not found</div>;

  const attendanceChartData = attendance.slice(0, 30).reverse().map(a => ({
    date: new Date(a.date).toLocaleDateString(),
    present: a.status === 'present' ? 1 : 0,
    absent: a.status === 'absent' ? 1 : 0
  }));

  const marksChartData = marks.map(m => ({
    subject: m.subject,
    marks: m.marks,
    examType: m.examType
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/students')}
            className="text-blue-600 hover:underline mb-2"
          >
            ← Back to Students
          </button>
          <h1 className="text-3xl font-bold">{student.name}'s Profile</h1>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>

      {/* Student Info Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Student Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-semibold">{student.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Roll Number</p>
            <p className="font-semibold">{student.rollNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-semibold">{student.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Class</p>
            <p className="font-semibold">{student.class}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-semibold">{student.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              student.status === 'approved' ? 'bg-green-100 text-green-800' :
              student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {student.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Attendance</h3>
          <p className="text-3xl font-bold">{attendanceStats?.percentage || 0}%</p>
          <p className="text-sm text-gray-500">{attendance.length} records</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Average Marks</h3>
          <p className="text-3xl font-bold">{attendanceStats?.averageMarks || 0}</p>
          <p className="text-sm text-gray-500">{attendanceStats?.totalMarks || 0} exams</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Total Marks</h3>
          <p className="text-3xl font-bold">{marks.length}</p>
          <p className="text-sm text-gray-500">Records</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {attendanceChartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Attendance Trend (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {marksChartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Marks by Subject</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marksChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="marks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    No attendance records
                  </td>
                </tr>
              ) : (
                attendance.slice(0, 20).map((a, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        a.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Marks History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Exam Type</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Marks</th>
                <th className="px-4 py-2 text-left">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {marks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No marks records
                  </td>
                </tr>
              ) : (
                marks.map((m, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{new Date(m.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{m.examType}</td>
                    <td className="px-4 py-2">{m.subject}</td>
                    <td className="px-4 py-2">{m.marks}/{m.totalMarks}</td>
                    <td className="px-4 py-2">{((m.marks / m.totalMarks) * 100).toFixed(2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

