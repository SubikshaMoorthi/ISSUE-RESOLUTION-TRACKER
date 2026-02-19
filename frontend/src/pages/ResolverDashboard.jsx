import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const ResolverDashboard = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        // Fetch tasks assigned to this specific resolver
        API.get(`/issues/resolver/${user.userId}`)
            .then(res => setTasks(res.data))
            .catch(err => console.error("Error fetching resolver tasks", err));
    }, [user.userId]);

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status !== 'RESOLVED').length,
        completed: tasks.filter(t => t.status === 'RESOLVED').length
    };

    return (
        <div>
            <h1 style={{ marginBottom: '30px' }}>Resolver Portal: {user.department}</h1>
            
            <div style={styles.statsRow}>
                <div style={{...styles.statCard, background: '#4f46e5'}}>
                    Assigned Tasks <br/> <h2>{stats.total}</h2>
                </div>
                <div style={{...styles.statCard, background: '#ca8a04'}}>
                    Pending <br/> <h2>{stats.pending}</h2>
                </div>
                <div style={{...styles.statCard, background: '#16a34a'}}>
                    Completed <br/> <h2>{stats.completed}</h2>
                </div>
            </div>

            <h3 style={{ marginTop: '40px' }}>Your Department: {user.department}</h3>
            <p style={{ color: '#64748b' }}>Use the 'Assigned Issues' tab in the sidebar to update task statuses.</p>
        </div>
    );
};

const styles = {
    statsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    statCard: { 
        flex: '1 1 200px', 
        padding: '30px', 
        borderRadius: '15px', 
        color: 'white', 
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    }
};

export default ResolverDashboard;