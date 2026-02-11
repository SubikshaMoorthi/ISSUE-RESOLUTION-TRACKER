import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const UserDashboard = () => {
  const [view, setView] = useState('list');
  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'IT', priority: 'MEDIUM' });

  useEffect(() => { fetchIssues(); }, []);

  const fetchIssues = async () => {
    const { data } = await API.get('/issues/my-issues');
    setIssues(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/issues', form);
    setForm({ title: '', description: '', category: 'IT', priority: 'MEDIUM' });
    setView('list');
    fetchIssues();
  };

  const updateSatisfaction = async (id, status) => {
    await API.patch(`/issues/${id}/satisfaction?satisfied=${status}`);
    fetchIssues();
  };

  const deleteIssue = async (id) => {
    if (window.confirm("Are you sure?")) {
      await API.delete(`/issues/${id}`);
      fetchIssues();
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar setView={setView} />
      <main className="flex-grow p-8">
        {view === 'create' ? (
          <form onSubmit={handleCreate} className="max-w-xl bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Report New Issue</h2>
            <input className="w-full border p-2 mb-4" placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea className="w-full border p-2 mb-4" placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} required />
            <select className="w-full border p-2 mb-4" onChange={e => setForm({...form, category: e.target.value})}>
              <option value="IT">IT</option><option value="HR">HR</option><option value="FINANCE">Finance</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit Ticket</button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
            {issues.map(issue => (
              <div key={issue.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{issue.title}</h3>
                  <p className="text-sm text-gray-500">Status: <span className="font-semibold text-blue-600">{issue.status}</span></p>
                  <p className="text-sm">Assigned To: {issue.assignedToName || 'Searching...'}</p>
                </div>
                <div className="flex gap-2">
                  {issue.status === 'RESOLVED' && (
                    <>
                      <button onClick={() => updateSatisfaction(issue.id, true)} className="bg-green-100 text-green-700 px-3 py-1 rounded">Yes, Fixed!</button>
                      <button onClick={() => updateSatisfaction(issue.id, false)} className="bg-orange-100 text-orange-700 px-3 py-1 rounded">No, Still Broken</button>
                    </>
                  )}
                  <button onClick={() => deleteIssue(issue.id)} className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;