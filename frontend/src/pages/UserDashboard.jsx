import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const UserDashboard = () => {
  const [view, setView] = useState('list');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'IT', priority: 'MEDIUM' });

  useEffect(() => { 
    if (view === 'list') fetchIssues(); 
  }, [view]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/issues/my-issues'); 
      setIssues(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/issues', form);
      setForm({ title: '', description: '', category: 'IT', priority: 'MEDIUM' });
      setView('list');
    } catch (error) {
      alert("Failed to create issue. Please check your connection.");
    }
  };

  const updateSatisfaction = async (id, status) => {
    try {
      await API.patch(`/issues/${id}/satisfaction?satisfied=${status}`);
      fetchIssues();
    } catch (error) {
      console.error("Error updating satisfaction:", error);
    }
  };

  const deleteIssue = async (id) => {
    if (window.confirm("Are you sure you want to delete this pending issue?")) {
      try {
        await API.delete(`/issues/${id}`);
        fetchIssues();
      } catch (error) {
        alert("Could not delete. The issue might be in progress.");
      }
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar setView={setView} />
      <main className="flex-grow p-8">
        {view === 'create' ? (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Report New Issue</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input className="w-full border rounded-md p-2 mt-1" placeholder="e.g., System login error" onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea className="w-full border rounded-md p-2 mt-1 h-32" placeholder="Provide details about the issue..." onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select className="w-full border rounded-md p-2 mt-1" onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Submit Issue</button>
                <button type="button" onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">My Reported Issues</h2>
              <button onClick={() => setView('create')} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">+ Report Issue</button>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Updating list...</div>
            ) : issues.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed">
                <p className="text-gray-400">No issues found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {issues.map(issue => (
                  <div key={issue.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{issue.title}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${issue.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {issue.status}
                        </span>
                        <p className="text-sm text-gray-500">Assigned To: <span className="font-medium text-gray-700">{issue.assignedToName || 'Unassigned'}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {issue.status === 'RESOLVED' && (
                        <div className="flex items-center gap-2 border-r pr-3 mr-1">
                          <span className="text-sm text-gray-600">Fixed?</span>
                          <button onClick={() => updateSatisfaction(issue.id, true)} className="p-1 hover:bg-green-50 rounded text-green-600">👍</button>
                          <button onClick={() => updateSatisfaction(issue.id, false)} className="p-1 hover:bg-red-50 rounded text-red-600">👎</button>
                        </div>
                      )}
                      {issue.status === 'PENDING' && (
                        <button onClick={() => deleteIssue(issue.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete Issue</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;