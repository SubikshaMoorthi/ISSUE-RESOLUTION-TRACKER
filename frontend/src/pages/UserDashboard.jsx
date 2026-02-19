import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        API.get(`/issues/user/${user.userId}`).then(res => setIssues(res.data));
    }, [user.userId]);

    const stats = {
        total: issues.length,
        resolved: issues.filter(i => i.status === 'RESOLVED').length,
        inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
        pending: issues.filter(i => i.status === 'OPEN').length
    };

    return (
        <div>
            <h1 style={{ marginBottom: '30px' }}>Welcome {user?.name || 'User'} !</h1>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ ...styles.card, background: '#4f46e5' }}>Total Issues <br/> <h2>{stats.total}</h2></div>
                <div style={{ ...styles.card, background: '#16a34a' }}>Resolved <br/> <h2>{stats.resolved}</h2></div>
                <div style={{ ...styles.card, background: '#06b6d4' }}>In Progress <br/> <h2>{stats.inProgress}</h2></div>
                <div style={{ ...styles.card, background: '#ca8a04' }}>Pending <br/> <h2>{stats.pending}</h2></div>
            </div>
            <h3 style={{ marginTop: '40px' }}>Recent Issues</h3>
            <div style={styles.recentContainer}>
                {issues.slice(0, 2).map(i => (
                    <div key={i.id} style={styles.miniCard}>
                        <h4>{i.title}</h4>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>{i.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    card: { flex: '1 1 200px', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center', fontWeight: 'bold' },
    recentContainer: { background: '#d1d5db', padding: '40px', borderRadius: '20px', display: 'flex', gap: '20px', marginTop: '15px' },
    miniCard: { background: 'white', padding: '20px', borderRadius: '15px', width: '220px', textAlign: 'center' }
};

export default UserDashboard;