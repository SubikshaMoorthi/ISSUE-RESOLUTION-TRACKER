import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { Users, Search, Filter, Loader2, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const UserInfo = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await API.get('/auth/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Could not load user data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
            try {
                setDeletingId(userId);
                await API.delete(`/auth/users/${userId}`);
                await fetchUsers();
            } catch (err) {
                console.error("Failed to delete user", err);
                alert(err?.response?.data?.message || 'Failed to delete user');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesRole = filter === 'ALL' || u.role === filter;
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Loader2 className="animate-spin" size={40} color="#2563eb" />
                <p style={{ marginLeft: '10px' }}>Loading Directory...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                <h3>{error}</h3>
                <button onClick={fetchUsers} style={styles.retryBtn}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Users size={28} color="#2563eb" />
                    <h2 style={{ marginLeft: '10px', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        All Users
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={styles.searchBox}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            style={styles.searchInner}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={styles.searchBox}>
                        <Filter size={18} color="#94a3b8" />
                        <select
                            style={styles.searchInner}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ROLE_USER">Users</option>
                            <option value="ROLE_RESOLVER">Resolvers</option>
                            <option value="ROLE_ADMIN">Admins</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={styles.tableCard}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Department</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, idx) => (
                            <tr
                                key={user.id}
                                style={{
                                    ...styles.tr,
                                    backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc',
                                }}
                            >
                                <td style={styles.td}>{user.id}</td>
                                <td style={styles.td}>
                                    <strong>{user.name}</strong>
                                </td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: user.role === 'ROLE_ADMIN' ? '#dbeafe' :
                                            user.role === 'ROLE_RESOLVER' ? '#fef3c7' : '#dcfce7',
                                        color: user.role === 'ROLE_ADMIN' ? '#1e40af' :
                                            user.role === 'ROLE_RESOLVER' ? '#92400e' : '#166534'
                                    }}>
                                        {user.role.split('_')[1]}
                                    </span>
                                </td>
                                <td style={styles.td}>{user.department || '-'}</td>
                                <td style={styles.td}>
                                    {Number(user.id) === Number(currentUser?.userId || currentUser?.id) ? (
                                        <span style={styles.selfBadge}>Current User</span>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
                                            disabled={deletingId === user.id}
                                            style={{
                                                ...styles.deleteBtn,
                                                opacity: deletingId === user.id ? 0.6 : 1
                                            }}
                                        >
                                            <Trash2 size={16} />
                                            {deletingId === user.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
                        No users found
                    </p>
                )}
            </div>

            <div style={{ marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
                Showing {filteredUsers.length} of {users.length} users
            </div>
        </div>
    );
};

const styles = {
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        minWidth: '200px'
    },
    searchInner: {
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: '14px',
        color: '#475569',
        flex: 1,
        fontFamily: 'inherit'
    },
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
    },
    th: {
        padding: '16px',
        fontWeight: '600',
        color: '#334155',
        fontSize: '14px',
        textAlign: 'left'
    },
    tr: {
        borderBottom: '1px solid #e2e8f0',
        transition: 'background-color 0.2s ease'
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#475569'
    },
    badge: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600'
    },
    deleteBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #fca5a5',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    selfBadge: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#475569',
        backgroundColor: '#e2e8f0'
    },
    retryBtn: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    }
};

export default UserInfo;
