import React from 'react';
import { LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setView }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col p-4 shadow-xl">
      <h1 className="text-xl font-bold mb-10 border-b border-slate-700 pb-4">Issue Tracker</h1>
      <nav className="space-y-4 flex-grow">
        <button onClick={() => setView('list')} className="flex items-center gap-3 hover:bg-slate-800 w-full p-2 rounded">
          <LayoutDashboard size={20} /> My Issues
        </button>
        <button onClick={() => setView('create')} className="flex items-center gap-3 hover:bg-slate-800 w-full p-2 rounded">
          <PlusCircle size={20} /> Create Issue
        </button>
      </nav>
      <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 p-2 mt-auto">
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
};

export default Sidebar;