import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { MessageCircle, Calendar } from 'lucide-react';

const ResolverFeedbacks = () => {
    const { user } = useContext(AuthContext);
    const resolverId = user?.userId || user?.id;
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                if (!resolverId) return;
                const res = await API.get(`/issues/resolver/${resolverId}/feedbacks`);
                setFeedbacks(res.data);
            } catch (err) {
                console.error('Error fetching feedbacks:', err);
            } finally {
                setLoading(false);
            }
        };

        if (resolverId) {
            fetchFeedbacks();
        }
    }, [resolverId]);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });

    const getFilteredFeedbacks = () => {
        if (filter === 'ALL') return feedbacks;
        if (filter === 'POSITIVE') return feedbacks.filter(f => f.rating >= 4);
        if (filter === 'NEUTRAL') return feedbacks.filter(f => f.rating >= 2.5 && f.rating < 4);
        if (filter === 'NEGATIVE') return feedbacks.filter(f => f.rating < 2.5);
        return feedbacks;
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return '#16a34a';
        if (rating >= 2.5) return '#ca8a04';
        return '#ef4444';
    };

    const getRatingBgColor = (rating) => {
        if (rating >= 4) return '#dcfce7';
        if (rating >= 2.5) return '#fef08a';
        return '#fee2e2';
    };

    if (loading) {
        return <div style={styles.container}>Loading...</div>;
    }

    const filteredFeedbacks = getFilteredFeedbacks();
    const stats = {
        total: feedbacks.length,
        positive: feedbacks.filter(f => f.rating >= 4).length,
        neutral: feedbacks.filter(f => f.rating >= 2.5 && f.rating < 4).length,
        negative: feedbacks.filter(f => f.rating < 2.5).length
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Your Feedback</h1>
                <p style={styles.subtitle}>Feedback from resolved issues</p>
            </div>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.total}</div>
                    <p style={styles.statLabel}>Total Feedbacks</p>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.positive}</div>
                    <p style={styles.statLabel}>Positive</p>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.neutral}</div>
                    <p style={styles.statLabel}>Neutral</p>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.negative}</div>
                    <p style={styles.statLabel}>Negative</p>
                </div>
            </div>

            <div style={styles.filterTabs}>
                {[
                    { label: 'ALL', value: 'ALL', color: '#64748b' },
                    { label: 'Positive', value: 'POSITIVE', color: '#16a34a' },
                    { label: 'Neutral', value: 'NEUTRAL', color: '#ca8a04' },
                    { label: 'Negative', value: 'NEGATIVE', color: '#ef4444' }
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        style={{
                            ...styles.filterTab,
                            backgroundColor: filter === tab.value ? tab.color : '#e2e8f0',
                            color: filter === tab.value ? 'white' : '#1e293b'
                        }}
                    >
                        {tab.label}
                        <span style={styles.filterCount}>
                            {tab.value === 'ALL' ? stats.total :
                                tab.value === 'POSITIVE' ? stats.positive :
                                    tab.value === 'NEUTRAL' ? stats.neutral :
                                        stats.negative}
                        </span>
                    </button>
                ))}
            </div>

            {filteredFeedbacks.length > 0 ? (
                <div style={styles.feedbackGrid}>
                    {filteredFeedbacks.map((feedback) => (
                        <div
                            key={feedback.id}
                            style={{
                                ...styles.feedbackCard,
                                borderTop: `4px solid ${getRatingColor(feedback.rating)}`
                            }}
                        >
                            <div style={styles.cardHeader}>
                                <div style={styles.userSection}>
                                    <div style={styles.userAvatar}>
                                        {feedback.from_user?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={styles.userName}>{feedback.from_user}</p>
                                        <p style={styles.userSubtext}>
                                            <Calendar size={12} style={{ marginRight: '4px' }} />
                                            {formatDate(feedback.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        ...styles.ratingBadge,
                                        backgroundColor: getRatingBgColor(feedback.rating)
                                    }}
                                >
                                    <span style={{ color: getRatingColor(feedback.rating) }}>
                                        {'*'.repeat(Math.round(feedback.rating))}
                                    </span>
                                    <span style={{
                                        color: getRatingColor(feedback.rating),
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        marginLeft: '4px'
                                    }}>
                                        {feedback.rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.commentSection}>
                                <p style={styles.commentText}>
                                    "{feedback.comment}"
                                </p>
                            </div>

                            <div style={styles.cardFooter}>
                                <div style={styles.footerMeta}>
                                    <MessageCircle size={14} />
                                    Issue #{feedback.id}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.emptyState}>
                    <MessageCircle size={48} color="#cbd5e1" />
                    <p style={styles.emptyStateText}>No feedbacks found for this filter</p>
                </div>
            )}
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
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 6px 14px -14px rgba(15, 23, 42, 0.8)',
        textAlign: 'center'
    },
    statValue: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#4f46e5',
        margin: '0 0 6px 0'
    },
    statLabel: {
        fontSize: '12px',
        color: '#64748b',
        margin: 0,
        fontWeight: '600'
    },
    filterTabs: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
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
        opacity: 0.7
    },
    feedbackGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px'
    },
    feedbackCard: {
        backgroundColor: 'white',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 10px 18px -18px rgba(15, 23, 42, 0.9)',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        gap: '12px'
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    userAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#e0e7ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '700',
        color: '#4f46e5'
    },
    userName: {
        margin: '0 0 2px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
    },
    userSubtext: {
        margin: 0,
        fontSize: '12px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    ratingBadge: {
        padding: '8px 12px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '14px',
        fontWeight: '600',
        whiteSpace: 'nowrap'
    },
    commentSection: {
        marginBottom: '16px'
    },
    commentText: {
        margin: 0,
        fontSize: '14px',
        color: '#475569',
        lineHeight: '1.6',
        fontStyle: 'italic'
    },
    cardFooter: {
        paddingTop: '12px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    footerMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        color: '#64748b'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center'
    },
    emptyStateText: {
        marginTop: '16px',
        fontSize: '14px',
        color: '#64748b'
    }
};

export default ResolverFeedbacks;
