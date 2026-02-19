import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const ResolverTasks = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = () => {
        API.get(`/issues/resolver/${user.userId}`).then(res => setTasks(res.data));
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/issues/${id}/status`, { status: newStatus });
            fetchTasks(); // Refresh the list after update
        } catch (err) {
            alert("Failed to update status");
        }
    };

    return (
        <div>
            <h2>Assigned Task Queue</h2>
            <table style={styles.table}>
                <thead style={{ background: '#f8fafc' }}>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Title</th>
                        <th style={styles.th}>Reporter</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Update</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={styles.td}>{t.id}</td>
                            <td style={styles.td}>{t.title}</td>
                            <td style={styles.td}>{t.reporter_name}</td>
                            <td style={styles.td}>
                                <span style={{ fontWeight: 'bold' }}>{t.status}</span>
                            </td>
                            <td style={styles.td}>
                                <select 
                                    value={t.status} 
                                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="RESOLVED">RESOLVED</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' },
    th: { padding: '12px', borderBottom: '2px solid #e2e8f0' },
    td: { padding: '12px' },
    select: { padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }
};

export default ResolverTasks;