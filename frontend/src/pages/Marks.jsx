import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Marks() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    examType: '',
    subject: '',
    marks: '',
    totalMarks: 100
  });

  useEffect(() => {
    fetchStudents();
    fetchMarks();
  }, []);

  useEffect(() => {
    filterMarks();
  }, [searchTerm, examFilter, marks]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      toast.error('Error fetching students');
      console.error(err);
    }
  };

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/marks/student/all');
      setMarks(res.data);
    } catch (err) {
      toast.error('Error fetching marks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterMarks = () => {
    let filtered = marks;
    
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.studentId?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (examFilter) {
      filtered = filtered.filter(m => m.examType === examFilter);
    }
    
    setFilteredMarks(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marks', formData);
      toast.success('Marks added successfully');
      fetchMarks();
      setShowForm(false);
      setFormData({ studentId: '', examType: '', subject: '', marks: '', totalMarks: 100 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving marks');
    }
  };

  const exportToExcel = () => {
    const data = [
      ['Marks Report'],
      [],
      ['Student', 'Roll Number', 'Class', 'Exam Type', 'Subject', 'Marks', 'Total Marks', 'Percentage', 'Date']
    ];
    
    filteredMarks.forEach(mark => {
      const percentage = ((mark.marks / mark.totalMarks) * 100).toFixed(2);
      data.push([
        mark.studentId?.name || 'N/A',
        mark.studentId?.rollNumber || 'N/A',
        mark.studentId?.class || 'N/A',
        mark.examType,
        mark.subject,
        mark.marks,
        mark.totalMarks,
        `${percentage}%`,
        new Date(mark.date).toLocaleDateString()
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks');
    XLSX.writeFile(wb, `Marks_Report.xlsx`);
    toast.success('Marks exported successfully');
  };

  const uniqueExamTypes = [...new Set(marks.map(m => m.examType))].sort();
  const chartData = marks.reduce((acc, m) => {
    const subject = m.subject;
    const existing = acc.find(item => item.subject === subject);
    if (existing) {
      existing.marks += m.marks;
      existing.count += 1;
    } else {
      acc.push({ subject, marks: m.marks, count: 1 });
    }
    return acc;
  }, []).map(item => ({
    subject: item.subject,
    average: (item.marks / item.count).toFixed(2)
  }));

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marks</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export Excel
          </button>
          {user?.role !== 'student' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Marks
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by student name, roll number, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Exam Types</option>
            {uniqueExamTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setExamFilter('');
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Average Marks by Subject</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#3b82f6" name="Average Marks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {showForm && user?.role !== 'student' && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Add Marks</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="px-3 py-2 border rounded"
              required
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Exam Type (e.g., Midterm, Final)"
              value={formData.examType}
              onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="px-3 py-2 border rounded"
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Marks"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                className="px-3 py-2 border rounded flex-1"
                required
                min="0"
                max={formData.totalMarks}
              />
              <span className="self-center">/</span>
              <input
                type="number"
                placeholder="Total"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                className="px-3 py-2 border rounded w-24"
                required
                min="1"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <span className="font-semibold">Total Records: {filteredMarks.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Roll Number</th>
                <th className="px-4 py-2 text-left">Class</th>
                <th className="px-4 py-2 text-left">Exam</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Marks</th>
                <th className="px-4 py-2 text-left">Percentage</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No marks found
                  </td>
                </tr>
              ) : (
                filteredMarks.map(mark => {
                  const percentage = ((mark.marks / mark.totalMarks) * 100).toFixed(2);
                  return (
                    <tr key={mark._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{mark.studentId?.name || 'N/A'}</td>
                      <td className="px-4 py-2">{mark.studentId?.rollNumber || 'N/A'}</td>
                      <td className="px-4 py-2">{mark.studentId?.class || 'N/A'}</td>
                      <td className="px-4 py-2">{mark.examType}</td>
                      <td className="px-4 py-2">{mark.subject}</td>
                      <td className="px-4 py-2 font-semibold">{mark.marks}/{mark.totalMarks}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          percentage >= 80 ? 'bg-green-100 text-green-800' :
                          percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(mark.date).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
