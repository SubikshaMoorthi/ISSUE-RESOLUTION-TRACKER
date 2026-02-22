import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { X } from 'lucide-react';

const UserAllIssues = () => {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({
        satisfaction: 'YES',
        rating: 5,
        comment: ''
    });

    useEffect(() => {
        if (user?.userId || user?.role === 'ROLE_ADMIN') {
            fetchIssues();
        }
    }, [user?.userId, user?.role]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const endpoint = user?.role === 'ROLE_ADMIN'
                ? '/issues/admin/all'
                : `/issues/user/${user.userId}`;
            const res = await API.get(endpoint);
            setIssues(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching issues:', err);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeStyle = (status) => {
        const statusStyles = {
            RESOLVED: { bg: '#dcfce7', color: '#166534' },
            ASSIGNED: { bg: '#e0f2fe', color: '#0369a1' },
            IN_PROGRESS: { bg: '#e0f2fe', color: '#0369a1' },
            OPEN: { bg: '#fef3c7', color: '#92400e' }
        };
        return statusStyles[status] || { bg: '#f1f5f9', color: '#475569' };
    };

    const handleOpenIssue = (issue) => {
        setSelectedIssue(issue);
        setFeedback({
            satisfaction: 'YES',
            rating: 5,
            comment: issue.feedback_text || ''
        });
    };

    const handleFeedbackSubmit = async (issueId) => {
        try {
            await API.put(`/issues/${issueId}/feedback`, {
                feedback_text: feedback.comment,
                feedback_type: feedback.satisfaction === 'YES' ? 'POSITIVE' : 'NEGATIVE',
                rating: feedback.rating
            });
            await fetchIssues();
            setSelectedIssue(null);
        } catch (err) {
            alert('Error submitting feedback: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: '#94a3b8' }}>Loading issues...</p>
            </div>
        );
    }

    const isAdminView = user?.role === 'ROLE_ADMIN';

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                    {isAdminView ? 'All Issues Log' : 'My Issues'}
                </h1>
                <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px' }}>
                    {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                </p>
            </div>

            <div style={styles.tableCard}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Title</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Date Created</th>
                            {isAdminView && <th style={styles.th}>Created By</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {issues.map((issue, idx) => {
                            const statusStyle = getStatusBadgeStyle(issue.status);
                            return (
                                <tr
                                    key={issue.id}
                                    style={{
                                        ...styles.tr,
                                        backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc'
                                    }}
                                >
                                    <td style={styles.td}>#{issue.id}</td>
                                    <td style={styles.td}>
                                        <button style={styles.titleBtn} onClick={() => handleOpenIssue(issue)}>
                                            {issue.title}
                                        </button>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.color
                                        }}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(issue.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: '2-digit'
                                        })}
                                    </td>
                                    {isAdminView && <td style={styles.td}>{issue.reporter_name || 'Unknown'}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {issues.length === 0 && (
                    <p style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        No issues found.
                    </p>
                )}
            </div>

            {selectedIssue && (
                <div style={styles.modalOverlay} onClick={() => setSelectedIssue(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={{ margin: 0 }}>{selectedIssue.title}</h2>
                            <button onClick={() => setSelectedIssue(null)} style={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={styles.modalContent}>
                            <p style={styles.label}>Description</p>
                            <p style={styles.value}>{selectedIssue.description || 'No description provided.'}</p>

                            <div style={styles.infoRow}>
                                <div>
                                    <p style={styles.label}>Date Created</p>
                                    <p style={styles.value}>
                                        {new Date(selectedIssue.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p style={styles.label}>Status</p>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: getStatusBadgeStyle(selectedIssue.status).bg,
                                        color: getStatusBadgeStyle(selectedIssue.status).color
                                    }}>
                                        {selectedIssue.status}
                                    </span>
                                </div>
                            </div>

                            {!isAdminView &&
                                selectedIssue.status === 'RESOLVED' &&
                                !selectedIssue.feedback_text &&
                                !selectedIssue.rating && (
                                <div style={styles.feedbackSection}>
                                    <h3 style={styles.feedbackTitle}>Feedback</h3>

                                    <div style={{ marginBottom: '12px' }}>
                                        <p style={styles.label}>Satisfied</p>
                                        <div style={styles.toggleWrap}>
                                            {['YES', 'NO'].map((value) => (
                                                <button
                                                    key={value}
                                                    onClick={() => setFeedback((prev) => ({ ...prev, satisfaction: value }))}
                                                    style={{
                                                        ...styles.toggleBtn,
                                                        ...(feedback.satisfaction === value ? styles.toggleBtnActive : {})
                                                    }}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <p style={styles.label}>Rating</p>
                                        <div style={styles.starRow}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setFeedback((prev) => ({ ...prev, rating: star }))}
                                                    style={styles.starBtn}
                                                >
                                                    <span style={{
                                                        color: star <= feedback.rating ? '#f59e0b' : '#cbd5e1',
                                                        fontSize: '24px'
                                                    }}>
                                                        ★
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <p style={styles.label}>Comment</p>
                                        <textarea
                                            value={feedback.comment}
                                            onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
                                            placeholder="Write your feedback..."
                                            style={styles.commentBox}
                                        />
                                    </div>

                                    <button
                                        onClick={() => handleFeedbackSubmit(selectedIssue.id)}
                                        style={styles.submitBtn}
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            )}

                            {!isAdminView &&
                                selectedIssue.status === 'RESOLVED' &&
                                (selectedIssue.feedback_text || selectedIssue.rating) && (
                                <div style={styles.feedbackSection}>
                                    <h3 style={styles.feedbackTitle}>Submitted Feedback</h3>
                                    <p style={styles.value}>{selectedIssue.feedback_text}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
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
        borderBottom: '1px solid #e2e8f0'
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#475569'
    },
    titleBtn: {
        border: 'none',
        backgroundColor: 'transparent',
        color: '#2563eb',
        fontWeight: '600',
        cursor: 'pointer',
        padding: 0,
        textDecoration: 'underline'
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '92%'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b',
        display: 'flex'
    },
    modalContent: {
        padding: '24px'
    },
    label: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
        margin: '0 0 6px 0',
        textTransform: 'uppercase'
    },
    value: {
        fontSize: '14px',
        color: '#1e293b',
        margin: 0,
        lineHeight: 1.6
    },
    infoRow: {
        marginTop: '18px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
    },
    badge: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    feedbackSection: {
        marginTop: '22px',
        paddingTop: '18px',
        borderTop: '1px solid #e2e8f0'
    },
    feedbackTitle: {
        margin: '0 0 14px 0',
        color: '#1e293b',
        fontSize: '18px'
    },
    toggleWrap: {
        display: 'flex',
        gap: '8px'
    },
    toggleBtn: {
        border: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#334155',
        padding: '8px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    toggleBtnActive: {
        borderColor: '#2563eb',
        backgroundColor: '#dbeafe',
        color: '#1d4ed8'
    },
    starRow: {
        display: 'flex',
        gap: '6px'
    },
    starBtn: {
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        padding: 0
    },
    commentBox: {
        width: '100%',
        minHeight: '100px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        resize: 'vertical'
    },
    submitBtn: {
        padding: '10px 20px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px'
    }
};

export default UserAllIssues;
