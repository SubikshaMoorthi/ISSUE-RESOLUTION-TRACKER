import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import IssueModal from '../components/IssueModal';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const ResolverAssignedIssues = () => {
    const { user } = useContext(AuthContext);
    const resolverId = user?.userId || user?.id;
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (resolverId) {
            fetchAssignedIssues();
        }
    }, [resolverId]);

    const fetchAssignedIssues = async () => {
        if (!resolverId) {
            setError('Resolver ID missing. Please logout and login again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await API.get(`/issues/resolver/${resolverId}`);
            setIssues(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching assigned issues:', err);
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                setError('Session expired or unauthorized. Please login again.');
            } else {
                setError(err?.response?.data?.message || 'Failed to load assigned issues. Please try again.');
            }
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkResolved = async (issueId) => {
        try {
            await API.put(`/issues/${issueId}/status`, { status: 'RESOLVED' });
            await fetchAssignedIssues();
            setSelectedIssue(null);
        } catch (err) {
            alert('Failed to mark issue as resolved');
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '-';

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'RESOLVED':
                return <CheckCircle2 size={16} color="#16a34a" />;
            case 'IN_PROGRESS':
                return <Clock size={16} color="#0369a1" />;
            default:
                return <AlertCircle size={16} color="#92400e" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RESOLVED':
                return '#dcfce7';
            case 'IN_PROGRESS':
                return '#e0f2fe';
            case 'OPEN':
                return '#fef3c7';
            default:
                return '#f1f5f9';
        }
    };

    const isResolved = (status) => String(status || '').trim().toUpperCase() === 'RESOLVED';
    const hasFeedback = (issue) => Boolean(issue?.feedback_text) || issue?.rating !== null;

    let filteredIssues = issues;
    if (filter === 'OPEN') {
        filteredIssues = issues.filter((i) => !isResolved(i.status));
    } else if (filter === 'RESOLVED') {
        filteredIssues = issues.filter((i) => isResolved(i.status));
    }

    const stats = {
        total: issues.length,
        open: issues.filter((i) => !isResolved(i.status)).length,
        resolved: issues.filter((i) => isResolved(i.status)).length
    };

    if (loading) {
        return <div style={styles.container}>Loading...</div>;
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorBox}>
                    <AlertCircle size={32} color="#ef4444" />
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={fetchAssignedIssues} style={styles.retryBtn}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Assigned Issues</h1>
                <p style={styles.subtitle}>{filteredIssues.length} issues in current view</p>
            </div>

            <div style={styles.statsContainer}>
                <div style={{ ...styles.statCard, backgroundColor: '#dbeafe' }}>
                    <p style={styles.statLabel}>Total Assigned</p>
                    <h3 style={styles.statValue}>{stats.total}</h3>
                </div>
                <div style={{ ...styles.statCard, backgroundColor: '#fef3c7' }}>
                    <p style={styles.statLabel}>Open / In Progress</p>
                    <h3 style={styles.statValue}>{stats.open}</h3>
                </div>
                <div style={{ ...styles.statCard, backgroundColor: '#dcfce7' }}>
                    <p style={styles.statLabel}>Resolved</p>
                    <h3 style={styles.statValue}>{stats.resolved}</h3>
                </div>
            </div>

            <div style={styles.filterTabs}>
                {['ALL', 'OPEN', 'RESOLVED'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        style={{
                            ...styles.filterTab,
                            backgroundColor: filter === tab ? '#2563eb' : '#e2e8f0',
                            color: filter === tab ? '#ffffff' : '#1e293b'
                        }}
                    >
                        {tab}
                        <span style={styles.filterCount}>
                            {tab === 'ALL'
                                ? issues.length
                                : tab === 'OPEN'
                                    ? issues.filter((i) => !isResolved(i.status)).length
                                    : issues.filter((i) => isResolved(i.status)).length}
                        </span>
                    </button>
                ))}
            </div>

            <div style={styles.tableWrapper}>
                {filteredIssues.length > 0 ? (
                    <table style={styles.table}>
                        <thead style={styles.tableHead}>
                            <tr>
                                <th style={styles.th}>Issue ID</th>
                                <th style={styles.th}>Title</th>
                                <th style={styles.th}>Created By</th>
                                <th style={styles.th}>Date Assigned</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIssues.map((issue) => (
                                <tr key={issue.id} style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <code style={styles.issueId}>#{issue.id}</code>
                                    </td>
                                    <td
                                        style={{
                                            ...styles.td,
                                            ...styles.titleTd,
                                            cursor: 'pointer',
                                            color: '#2563eb',
                                            textDecoration: 'underline'
                                        }}
                                        onClick={() => setSelectedIssue(issue)}
                                    >
                                        {issue.title}
                                    </td>
                                    <td style={styles.td}>{issue.reporter_name || 'Unknown'}</td>
                                    <td style={styles.td}>{formatDate(issue.created_at)}</td>
                                    <td style={styles.td}>
                                        <div
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusColor(issue.status)
                                            }}
                                        >
                                            {getStatusIcon(issue.status)}
                                            <span style={{ marginLeft: '6px' }}>{issue.status}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {!isResolved(issue.status) && (
                                            <button onClick={() => setSelectedIssue(issue)} style={styles.viewBtn}>
                                                View
                                            </button>
                                        )}
                                        {isResolved(issue.status) && hasFeedback(issue) && (
                                            <button onClick={() => setSelectedIssue(issue)} style={styles.viewBtn}>
                                                View Feedback
                                            </button>
                                        )}
                                        {isResolved(issue.status) && !hasFeedback(issue) && (
                                            <span style={styles.resolvedBadge}>Feedback Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={styles.emptyState}>
                        <AlertCircle size={48} color="#cbd5e1" />
                        <p style={styles.emptyStateText}>
                            {filter === 'OPEN'
                                ? 'No open issues assigned to you'
                                : filter === 'RESOLVED'
                                    ? 'No resolved issues yet'
                                    : 'No issues assigned to you'}
                        </p>
                    </div>
                )}
            </div>

            {selectedIssue && (
                <IssueModal
                    issue={selectedIssue}
                    onClose={() => setSelectedIssue(null)}
                    onMarkResolved={handleMarkResolved}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px'
    },
    header: {
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        margin: 0,
        color: '#1e293b'
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    statCard: {
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(15, 23, 42, 0.05)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    statLabel: {
        margin: 0,
        fontSize: '13px',
        color: '#334155',
        fontWeight: '600'
    },
    statValue: {
        margin: '8px 0 0 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a'
    },
    filterTabs: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px'
    },
    filterTab: {
        padding: '10px 16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    filterCount: {
        fontSize: '12px',
        opacity: 0.8,
        marginLeft: '4px'
    },
    tableWrapper: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
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
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#1e293b',
        verticalAlign: 'middle'
    },
    titleTd: {
        maxWidth: '250px',
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
        color: '#2563eb'
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#1e293b'
    },
    viewBtn: {
        padding: '6px 12px',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600'
    },
    resolvedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
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
    },
    errorBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
    },
    errorText: {
        marginTop: '16px',
        fontSize: '14px',
        color: '#ef4444',
        fontWeight: '600'
    },
    retryBtn: {
        marginTop: '16px',
        padding: '10px 16px',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px'
    }
};

export default ResolverAssignedIssues;
