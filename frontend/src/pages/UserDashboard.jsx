import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { AlertCircle, CheckCircle, ListTodo, Users, X } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedback, setFeedback] = useState({
        satisfaction: 'YES',
        rating: 5,
        comment: ''
    });

    useEffect(() => {
        if (user?.userId || user?.id) {
            fetchIssues();
        }
    }, [user?.userId, user?.id]);

    const fetchIssues = async () => {
        try {
            const userId = user?.userId || user?.id;
            const res = await API.get(`/issues/user/${userId}`);
            setIssues(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error fetching user issues:', error);
            setIssues([]);
        }
    };

    const isResolved = (status) => String(status || '').trim().toUpperCase() === 'RESOLVED';
    const hasFeedback = (issue) => Boolean(issue?.feedback_text) || issue?.rating !== null;

    const openFeedbackModal = (issue) => {
        setSelectedIssue(issue);
        setFeedback({
            satisfaction: 'YES',
            rating: 5,
            comment: ''
        });
    };

    const handleFeedbackSubmit = async () => {
        if (!selectedIssue) return;
        if (hasFeedback(selectedIssue)) return;

        try {
            setSubmittingFeedback(true);
            await API.put(`/issues/${selectedIssue.id}/feedback`, {
                feedback_text: feedback.comment,
                feedback_type: feedback.satisfaction === 'YES' ? 'POSITIVE' : 'NEGATIVE',
                rating: feedback.rating
            });
            await fetchIssues();
            setSelectedIssue(null);
        } catch (err) {
            alert(err?.response?.data?.message || 'Error submitting feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const stats = {
        totalIssues: issues.length,
        resolved: issues.filter((i) => isResolved(i.status)).length,
        pending: issues.filter((i) => !isResolved(i.status)).length,
        assigned: issues.filter((i) => i.resolver_id).length
    };

    const recentIssues = [...issues]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>User Dashboard</h1>
                <p style={styles.subtitle}>Track your issue activity and latest updates</p>
            </div>

            <div style={styles.summaryGrid}>
                <SummaryCard
                    label="Total Issues"
                    value={stats.totalIssues}
                    icon={<ListTodo size={20} color="#3730a3" />}
                    backgroundColor="#e0e7ff"
                    iconBg="#c7d2fe"
                />
                <SummaryCard
                    label="Resolved Issues"
                    value={stats.resolved}
                    icon={<CheckCircle size={20} color="#166534" />}
                    backgroundColor="#dcfce7"
                    iconBg="#bbf7d0"
                />
                <SummaryCard
                    label="Pending Issues"
                    value={stats.pending}
                    icon={<AlertCircle size={20} color="#92400e" />}
                    backgroundColor="#fef3c7"
                    iconBg="#fde68a"
                />
                <SummaryCard
                    label="Assigned Issues"
                    value={stats.assigned}
                    icon={<Users size={20} color="#9f1239" />}
                    backgroundColor="#ffe4e6"
                    iconBg="#fecdd3"
                />
            </div>

            <div>
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Recent Issues</h3>
                <div style={styles.tableCard}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Title</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentIssues.length > 0 ? (
                                recentIssues.map((issue) => (
                                    <tr key={issue.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={styles.td}>#{issue.id}</td>
                                        <td style={styles.td}><strong>{issue.title}</strong></td>
                                        <td style={styles.td}>
                                            <span
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: isResolved(issue.status)
                                                        ? '#dcfce7'
                                                        : issue.status === 'IN_PROGRESS'
                                                            ? '#e0f2fe'
                                                            : '#fef3c7',
                                                    color: isResolved(issue.status)
                                                        ? '#166534'
                                                        : issue.status === 'IN_PROGRESS'
                                                            ? '#0369a1'
                                                            : '#92400e'
                                                }}
                                            >
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
                                        <td style={styles.td}>
                                            {isResolved(issue.status) && !hasFeedback(issue) ? (
                                                <button
                                                    onClick={() => openFeedbackModal(issue)}
                                                    style={styles.feedbackBtn}
                                                >
                                                    Give Feedback
                                                </button>
                                            ) : isResolved(issue.status) ? (
                                                <span style={styles.feedbackDone}>Submitted</span>
                                            ) : (
                                                <span style={styles.feedbackPending}>Available after resolution</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No issues raised yet. Start by raising an issue!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedIssue && (
                <div style={styles.modalOverlay} onClick={() => setSelectedIssue(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={{ margin: 0 }}>Give Feedback</h2>
                            <button onClick={() => setSelectedIssue(null)} style={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <p style={styles.modalIssueMeta}>Issue #{selectedIssue.id}: {selectedIssue.title}</p>

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
                                            <span
                                                style={{
                                                    color: star <= feedback.rating ? '#f59e0b' : '#cbd5e1',
                                                    fontSize: '24px'
                                                }}
                                            >
                                                *
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <p style={styles.label}>Comment</p>
                                <textarea
                                    value={feedback.comment}
                                    onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Write your feedback..."
                                    style={styles.commentBox}
                                />
                            </div>

                            <button
                                onClick={handleFeedbackSubmit}
                                disabled={submittingFeedback}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: submittingFeedback ? 0.7 : 1
                                }}
                            >
                                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SummaryCard = ({ label, value, icon, backgroundColor, iconBg }) => (
    <div style={{ ...styles.summaryCard, backgroundColor }}>
        <div style={{ ...styles.iconWrap, backgroundColor: iconBg }}>
            {icon}
        </div>
        <p style={styles.cardLabel}>{label}</p>
        <h2 style={styles.cardValue}>{value}</h2>
    </div>
);

const styles = {
    page: {
        padding: '20px'
    },
    header: {
        marginBottom: '30px'
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
    },
    subtitle: {
        margin: 0,
        color: '#64748b',
        fontSize: '14px'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '36px'
    },
    summaryCard: {
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 10px 20px -16px rgba(15, 23, 42, 0.6)'
    },
    iconWrap: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px'
    },
    cardLabel: {
        color: '#64748b',
        fontSize: '13px',
        fontWeight: '600',
        margin: '0 0 8px 0'
    },
    cardValue: {
        margin: 0,
        fontSize: '38px',
        lineHeight: 1,
        fontWeight: '800',
        color: '#1e293b'
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 18px -18px rgba(15, 23, 42, 0.8)'
    },
    th: {
        padding: '15px 20px',
        color: '#64748b',
        fontWeight: '600',
        fontSize: '14px'
    },
    td: {
        padding: '15px 20px',
        color: '#1e293b',
        fontSize: '14px'
    },
    feedbackBtn: {
        padding: '7px 12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2563eb',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    feedbackDone: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#166534',
        backgroundColor: '#dcfce7',
        padding: '6px 10px',
        borderRadius: '8px'
    },
    feedbackPending: {
        fontSize: '12px',
        color: '#64748b'
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
        width: '92%',
        maxWidth: '560px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
        overflow: 'hidden'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 20px',
        borderBottom: '1px solid #e2e8f0'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b',
        display: 'flex'
    },
    modalBody: {
        padding: '20px'
    },
    modalIssueMeta: {
        margin: '0 0 14px 0',
        color: '#334155',
        fontSize: '14px',
        fontWeight: '600'
    },
    label: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
        margin: '0 0 6px 0',
        textTransform: 'uppercase'
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
        minHeight: '90px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        resize: 'vertical'
    },
    submitBtn: {
        width: '100%',
        padding: '10px 16px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    }
};

export default UserDashboard;
