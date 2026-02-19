import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

export default function Students() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('approved');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    class: '',
    phone: '',
    address: '',
    password: ''
  });

  useEffect(() => {
    fetchStudents();
    if (user?.role === 'admin') {
      fetchPendingStudents();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, classFilter, statusFilter, students, activeTab, pendingStudents]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (classFilter) params.append('class', classFilter);
      if (statusFilter && user?.role === 'admin') params.append('status', statusFilter);
      
      const res = await api.get(`/students?${params.toString()}`);
      setStudents(res.data);
    } catch (err) {
      toast.error('Error fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingStudents = async () => {
    try {
      const res = await api.get('/students/pending');
      setPendingStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filterStudents = () => {
    const list = activeTab === 'pending' ? pendingStudents : students;
    let filtered = list;

    if (activeTab === 'approved') {
      if (searchTerm) {
        filtered = filtered.filter(s =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (classFilter) {
        filtered = filtered.filter(s => s.class === classFilter);
      }
      if (statusFilter && user?.role === 'admin') {
        filtered = filtered.filter(s => s.status === statusFilter);
      }
    }

    setFilteredStudents(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/students/${editing}`, formData);
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', formData);
        toast.success('Student added successfully');
      }
      fetchStudents();
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', rollNumber: '', email: '', class: '', phone: '', address: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student');
    }
  };

  const handleEdit = (student) => {
    setEditing(student._id);
    setFormData({ ...student, password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
      if (user?.role === 'admin') {
        fetchPendingStudents();
      }
    } catch (err) {
      toast.error('Error deleting student');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/students/${id}/approve`);
      toast.success('Student approved successfully!');
      fetchStudents();
      fetchPendingStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving student');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this student registration?')) return;
    try {
      await api.put(`/students/${id}/reject`);
      toast.success('Student rejected');
      fetchStudents();
      fetchPendingStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting student');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to approve');
      return;
    }
    try {
      await api.post('/students/bulk-approve', { studentIds: selectedStudents });
      toast.success(`${selectedStudents.length} students approved successfully`);
      setSelectedStudents([]);
      fetchStudents();
      fetchPendingStudents();
    } catch (err) {
      toast.error('Error approving students');
    }
  };

  const handleBulkReject = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to reject');
      return;
    }
    if (!window.confirm(`Reject ${selectedStudents.length} students?`)) return;
    try {
      await api.post('/students/bulk-reject', { studentIds: selectedStudents });
      toast.success(`${selectedStudents.length} students rejected`);
      setSelectedStudents([]);
      fetchStudents();
      fetchPendingStudents();
    } catch (err) {
      toast.error('Error rejecting students');
    }
  };

  const toggleSelect = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const list = activeTab === 'pending' ? pendingStudents : filteredStudents;
    if (selectedStudents.length === list.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(list.map(s => s._id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const uniqueClasses = [...new Set(students.map(s => s.class))].sort();

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => { setShowForm(true); setEditing(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Student
          </button>
        )}
      </div>

      {user?.role === 'admin' && (
        <div className="mb-4 flex gap-2 border-b">
          <button
            onClick={() => { setActiveTab('approved'); setSelectedStudents([]); }}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'approved'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Approved Students ({students.length})
          </button>
          <button
            onClick={() => { setActiveTab('pending'); setSelectedStudents([]); }}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Pending Approval ({pendingStudents.length})
          </button>
        </div>
      )}

      {/* Search and Filters */}
      {activeTab === 'approved' && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded"
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {user?.role === 'admin' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setClassFilter('');
                setStatusFilter('');
                fetchStudents();
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {user?.role === 'admin' && activeTab === 'pending' && selectedStudents.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 flex gap-2">
          <span className="self-center">{selectedStudents.length} selected</span>
          <button
            onClick={handleBulkApprove}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Approve Selected
          </button>
          <button
            onClick={handleBulkReject}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reject Selected
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Student</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Roll Number *"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Class *"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            {!editing && (
              <input
                type="password"
                placeholder="Password (optional)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-3 py-2 border rounded"
              />
            )}
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                {editing ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'pending' && user?.role === 'admin' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {pendingStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending registrations
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === pendingStudents.length && pendingStudents.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Roll Number</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map(student => (
                  <tr key={student._id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleSelect(student._id)}
                      />
                    </td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.rollNumber}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">{student.class}</td>
                    <td className="px-4 py-2">{getStatusBadge(student.status)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleApprove(student._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(student._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Roll Number</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Class</th>
                {user?.role === 'admin' && (
                  <th className="px-4 py-2 text-left">Status</th>
                )}
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student._id} className="border-t hover:bg-gray-50">
                    <td 
                      className="px-4 py-2 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/students/${student._id}`)}
                    >
                      {student.name}
                    </td>
                    <td className="px-4 py-2">{student.rollNumber}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">{student.class}</td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-2">{getStatusBadge(student.status)}</td>
                    )}
                    <td className="px-4 py-2">
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="text-red-600 hover:underline mr-2"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/students/${student._id}`)}
                        className="text-green-600 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
