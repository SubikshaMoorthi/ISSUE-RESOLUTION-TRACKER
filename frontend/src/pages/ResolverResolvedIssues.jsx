import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { CheckCircle2 } from 'lucide-react';

const ResolverResolvedIssues = () => {
    const { user } = useContext(AuthContext);
    const resolverId = user?.userId || user?.id;
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (resolverId) {
            fetchResolvedIssues();
        }
    }, [resolverId]);

    const fetchResolvedIssues = async () => {
        try {
            if (!resolverId) return;
            const res = await API.get(`/issues/resolver/${resolverId}`);
            const resolvedOnly = (Array.isArray(res.data) ? res.data : []).filter(
                (issue) => String(issue.status || '').trim().toUpperCase() === 'RESOLVED'
            );
            resolvedOnly.sort((a, b) => {
                const aTime = new Date(a.updated_at || a.created_at).getTime() || 0;
                const bTime = new Date(b.updated_at || b.created_at).getTime() || 0;
                return bTime - aTime;
            });
            setIssues(resolvedOnly);
        } catch (err) {
            console.error('Error fetching resolved issues:', err);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div style={styles.container}>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Resolved Issues</h1>
                <p style={styles.subtitle}>{issues.length} issues resolved</p>
            </div>

            <div style={styles.tableWrapper}>
                {issues.length > 0 ? (
                    <table style={styles.table}>
                        <thead style={styles.tableHead}>
                            <tr>
                                <th style={styles.th}>Issue ID</th>
                                <th style={styles.th}>Title</th>
                                <th style={styles.th}>Created By</th>
                                <th style={styles.th}>Date Created</th>
                                <th style={styles.th}>Date Resolved</th>
                                <th style={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((issue) => (
                                <tr key={issue.id} style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <code style={styles.issueId}>#{issue.id}</code>
                                    </td>
                                    <td style={{ ...styles.td, ...styles.titleTd }}>{issue.title}</td>
                                    <td style={styles.td}>{issue.reporter_name || 'Unknown'}</td>
                                    <td style={styles.td}>{formatDateTime(issue.created_at)}</td>
                                    <td style={styles.td}>{formatDateTime(issue.updated_at || issue.created_at)}</td>
                                    <td style={styles.td}>
                                        <span style={styles.statusBadge}>RESOLVED</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={styles.emptyState}>
                        <CheckCircle2 size={48} color="#cbd5e1" />
                        <p style={styles.emptyStateText}>No resolved issues found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '0'
    },
    header: {
        marginBottom: '24px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        margin: '0 0 8px 0',
        color: '#1e293b'
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0
    },
    tableWrapper: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHead: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0'
    },
    th: {
        padding: '16px',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    tableRow: {
        borderBottom: '1px solid #e2e8f0'
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#1e293b'
    },
    titleTd: {
        maxWidth: '320px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    issueId: {
        backgroundColor: '#f1f5f9',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#4f46e5'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '700'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
    },
    emptyStateText: {
        marginTop: '16px',
        fontSize: '14px',
        color: '#64748b'
    }
};

export default ResolverResolvedIssues;
