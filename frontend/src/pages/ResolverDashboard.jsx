import React, { useState, useEffect } from 'react';
import API from '../services/api';

const ResolverDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => { fetchAssigned(); }, []);

  const fetchAssigned = async () => {
    try {
      const { data } = await API.get('/issues/assigned'); // Fetches issues by department
      setIssues(data);
    } catch (err) { console.error("Error fetching queue", err); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/issues/${id}/status?status=${status}`);
      fetchAssigned();
      setSelectedIssue(null);
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Resolver Task Queue</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issue List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Incoming Issues</h3>
          {issues.map(issue => (
            <div key={issue.id} onClick={() => setSelectedIssue(issue)} 
                 className="p-3 mb-2 border rounded cursor-pointer hover:bg-blue-50 transition">
              <div className="flex justify-between">
                <span className="font-bold">{issue.title}</span>
                <span className={`text-xs px-2 py-1 rounded ${issue.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                  {issue.priority}
                </span>
              </div>
              <p className="text-sm text-gray-500">From: {issue.userName}</p>
            </div>
          ))}
        </div>

        {/* Full Details & Status Update */}
        {selectedIssue && (
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
            <h3 className="text-2xl font-bold mb-2">{selectedIssue.title}</h3>
            <p className="text-gray-600 mb-4">{selectedIssue.description}</p>
            <div className="space-y-2 mb-6 text-sm">
              <p><strong>Category:</strong> {selectedIssue.category}</p>
              <p><strong>Current Status:</strong> {selectedIssue.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(selectedIssue.id, 'IN_PROGRESS')} className="bg-orange-500 text-white px-4 py-2 rounded">Start Work</button>
              <button onClick={() => updateStatus(selectedIssue.id, 'RESOLVED')} className="bg-green-600 text-white px-4 py-2 rounded">Mark Resolved</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolverDashboard;