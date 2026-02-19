import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const UserAllIssues = () => {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        API.get(`/issues/user/${user.userId}`).then(res => setIssues(res.data));
    }, [user.userId]);

    return (
        <div>
            <h2 style={{ marginBottom: '25px' }}>Your Complaint History</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Title</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.map(i => (
                            <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={styles.td}>{i.id}</td>
                                <td style={styles.td}><strong>{i.title}</strong></td>
                                <td style={styles.td}>{i.category}</td>
                                <td style={styles.td}>{new Date(i.created_at).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: i.status === 'RESOLVED' ? '#dcfce7' : i.status === 'IN_PROGRESS' ? '#e0f2fe' : '#fef3c7',
                                        color: i.status === 'RESOLVED' ? '#166534' : i.status === 'IN_PROGRESS' ? '#0369a1' : '#92400e'
                                    }}>
                                        {i.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {issues.length === 0 && <p style={{ padding: '20px', textAlign: 'center' }}>No issues found.</p>}
            </div>
        </div>
    );
};

const styles = {
    th: { padding: '15px 20px', color: '#64748b', fontWeight: '600' },
    td: { padding: '15px 20px', color: '#1e293b' }
};

export default UserAllIssues;