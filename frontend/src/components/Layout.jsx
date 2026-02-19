import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">SMS</h1>
          <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
        </div>
        <nav className="mt-8">
          <Link to="/" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
          {user?.role === 'student' ? (
            <Link to={`/students/${user.id}`} className="block px-4 py-2 hover:bg-gray-700">My Profile</Link>
          ) : (
            <>
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Link to="/students" className="block px-4 py-2 hover:bg-gray-700">Students</Link>
              )}
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Link to="/attendance" className="block px-4 py-2 hover:bg-gray-700">Attendance</Link>
              )}
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Link to="/marks" className="block px-4 py-2 hover:bg-gray-700">Marks</Link>
              )}
            </>
          )}
        </nav>
        <button
          onClick={handleLogout}
          className="absolute bottom-4 left-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}


