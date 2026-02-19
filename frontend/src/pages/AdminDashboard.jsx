import { useEffect, useState } from 'react';
import API from '../api/axios';

const AdminDashboard = ({ view = "log" }) => {
    const [issues, setIssues] = useState([]);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        API.get('/issues/admin/all').then(res => setIssues(res.data));
        API.get('/issues/admin/stats').then(res => setStats(res.data));
    }, []);

    if (view === "performance") {
        return (
            <div>
                <h2>Admin Performance Metrics</h2>
                <div style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
                    {stats.map(s => (
                        <div key={s.status} style={{background: '#3b82f6', color: 'white', padding: '30px', borderRadius: '10px', flex: 1, textAlign: 'center'}}>
                            <h3>{s.status}</h3>
                            <h1>{s.count}</h1>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>Global Issue Log</h2>
            <table style={styles.table}>
                <thead style={{background: '#f1f5f9'}}>
                    <tr><th>ID</th><th>Title</th><th>Category</th><th>Reporter</th><th>Resolver</th><th>Status</th></tr>
                </thead>
                <tbody>
                    {issues.map(i => (
                        <tr key={i.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                            <td>{i.id}</td><td>{i.title}</td><td>{i.category}</td>
                            <td>{i.reporter_name}</td><td>{i.resolver_name || 'Unassigned'}</td>
                            <td style={{fontWeight: 'bold'}}>{i.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }
};
export default AdminDashboard;