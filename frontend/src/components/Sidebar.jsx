import React from 'react';

const Sidebar = ({ setView }) => {
  const handleLogout = () => {
    localStorage.clear(); // Clears JWT and Role to secure the app
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
      <div className="p-6 text-2xl font-extrabold tracking-tight border-b border-indigo-800">
        ISSUE TRACKER
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {/* Updated from 'Create New Ticket' to 'Report New Issue' */}
        <button 
          onClick={() => setView('create')} 
          className="w-full text-left p-3 hover:bg-indigo-800 rounded-lg transition-colors font-medium"
        >
          Report New Issue
        </button>

        {/* Updated from 'View All Tickets' to 'View All Issues' */}
        <button 
          onClick={() => setView('list')} 
          className="w-full text-left p-3 hover:bg-indigo-800 rounded-lg transition-colors font-medium"
        >
          View All Issues
        </button>
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-500 hover:bg-red-600 p-3 rounded-lg transition font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;