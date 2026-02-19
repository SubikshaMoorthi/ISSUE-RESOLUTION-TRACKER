import { useEffect, useState } from 'react';
import API from '../api/axios';

const AdminPerformance = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        API.get('/issues/admin/stats').then(res => setStats(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Performance Center</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                {stats.map(s => (
                    <div key={s.status} style={{ flex: 1, background: '#3b82f6', color: 'white', padding: '40px 20px', borderRadius: '12px', textAlign: 'center' }}>
                        <h3>{s.status}</h3>
                        <h1 style={{ fontSize: '48px' }}>{s.count}</h1>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminPerformance;