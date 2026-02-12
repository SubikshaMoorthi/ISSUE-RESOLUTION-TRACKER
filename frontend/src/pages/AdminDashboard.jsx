import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER', department: 'IT' });

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    const userRes = await API.get('/admin/users');
    const issueRes = await API.get('/admin/issues');
    setUsers(userRes.data);
    setAllIssues(issueRes.data);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await API.post('/auth/register', newUser);
    alert("User Created!");
    fetchData();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold mb-8 text-indigo-900">Admin Control Center</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add User Form */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-xl font-bold mb-4">Register User/Resolver</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <input className="w-full border p-2 rounded" placeholder="Name" onChange={e => setNewUser({...newUser, name: e.target.value})} required />
            <input className="w-full border p-2 rounded" placeholder="Email" onChange={e => setNewUser({...newUser, email: e.target.value})} required />
            <input className="w-full border p-2 rounded" type="password" placeholder="Password" onChange={e => setNewUser({...newUser, password: e.target.value})} required />
            <select className="w-full border p-2 rounded" onChange={e => setNewUser({...newUser, role: e.target.value})}>
              <option value="USER">USER</option>
              <option value="RESOLVER">RESOLVER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select className="w-full border p-2 rounded" onChange={e => setNewUser({...newUser, department: e.target.value})}>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="FINANCE">Finance</option>
            </select>
            <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold">Add Account</button>
          </form>
        </div>

        {/* System Overview / Workload */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">Global Issue Monitoring</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Issue</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {allIssues.map(issue => (
                  <tr key={issue.id} className="border-b text-sm">
                    <td className="py-3">{issue.title}</td>
                    <td>{issue.status}</td>
                    <td>{issue.assignedToName || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;