import { LogOut, ListTodo } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ListTodo className="w-6 h-6 text-indigo-600" />
        <span className="font-semibold text-lg text-gray-800">Task Manager</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Hi, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
