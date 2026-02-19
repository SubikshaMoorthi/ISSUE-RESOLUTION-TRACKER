import { useState } from 'react';
import API from '../api/axios';

const RaiseIssue = () => {
    const [form, setForm] = useState({ title: '', description: '', category: 'IT' });
    const handleSubmit = async (e) => {
        e.preventDefault();
        await API.post('/issues/raise', form);
        alert('Issue submitted!');
    };
    return (
        <div style={{ padding: '20px' }}>
            <h2>Raise New Issue</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                <input type="text" placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} required />
                <textarea placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} required />
                <select onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="IT">IT</option><option value="MAINTENANCE">Maintenance</option><option value="HOSTEL">Hostel</option>
                </select>
                <button type="submit" style={{ background: '#4f46e5', color: 'white', padding: '10px' }}>Submit</button>
            </form>
        </div>
    );
};
export default RaiseIssue;