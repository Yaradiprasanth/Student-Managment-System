import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function Attendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [date]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      toast.error('Error fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/attendance/date/${date}`);
      const att = {};
      res.data.forEach(a => {
        if (a.studentId && a.studentId._id) {
          att[a.studentId._id] = a.status;
        }
      });
      setAttendance(att);
    } catch (err) {
      console.error(err);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await api.post('/attendance', { studentId, date, status });
      setAttendance({ ...attendance, [studentId]: status });
      toast.success('Attendance marked');
    } catch (err) {
      toast.error('Error marking attendance');
    }
  };

  const markAllPresent = () => {
    const attendances = students.map(s => ({
      studentId: s._id,
      status: 'present'
    }));
    handleBulkMark(attendances);
  };

  const markAllAbsent = () => {
    const attendances = students.map(s => ({
      studentId: s._id,
      status: 'absent'
    }));
    handleBulkMark(attendances);
  };

  const handleBulkMark = async (attendances) => {
    try {
      await api.post('/attendance/bulk', { attendances, date });
      toast.success(`${attendances.length} attendance records saved`);
      fetchAttendance();
    } catch (err) {
      toast.error('Error marking bulk attendance');
    }
  };

  const exportToExcel = () => {
    const data = [
      ['Date', date],
      [],
      ['Name', 'Roll Number', 'Class', 'Status']
    ];
    
    students.forEach(student => {
      data.push([
        student.name,
        student.rollNumber,
        student.class,
        attendance[student._id] || 'Not Marked'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Attendance_${date}.xlsx`);
    toast.success('Attendance exported successfully');
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export Excel
          </button>
          {user?.role !== 'student' && (
            <>
              <button
                onClick={markAllPresent}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Mark All Present
              </button>
              <button
                onClick={markAllAbsent}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Mark All Absent
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-4 bg-white p-4 rounded-lg shadow">
        <label className="block mb-2 font-semibold">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold">
              Total: {students.length} | 
              Present: {Object.values(attendance).filter(s => s === 'present').length} | 
              Absent: {Object.values(attendance).filter(s => s === 'absent').length} |
              Not Marked: {students.length - Object.keys(attendance).length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Roll Number</th>
                <th className="px-4 py-2 text-left">Class</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.rollNumber}</td>
                    <td className="px-4 py-2">{student.class}</td>
                    <td className="px-4 py-2">
                      {user?.role === 'student' ? (
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          attendance[student._id] === 'present'
                            ? 'bg-green-100 text-green-800'
                            : attendance[student._id] === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {attendance[student._id] ? attendance[student._id].toUpperCase() : 'NOT MARKED'}
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => markAttendance(student._id, 'present')}
                            className={`px-3 py-1 rounded text-sm ${
                              attendance[student._id] === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 hover:bg-green-100'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student._id, 'absent')}
                            className={`px-3 py-1 rounded text-sm ${
                              attendance[student._id] === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 hover:bg-red-100'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      )}
                    </td>
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
