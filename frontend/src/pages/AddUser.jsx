import { useState } from 'react';
import API from '../api/axios';

const AddUser = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ROLE_USER', department: '' });
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/register', formData);
            setMsg(res.data.message);
        } catch (err) { setMsg('Error creating user'); }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px' }}>
            <h2>Register New User</h2>
            {msg && <p>{msg}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
                <select onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_RESOLVER">Resolver</option>
                </select>
                {formData.role === 'ROLE_RESOLVER' && <input type="text" placeholder="Department" onChange={e => setFormData({...formData, department: e.target.value})} />}
                <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '10px' }}>Create User</button>
            </form>
        </div>
    );
};
export default AddUser;