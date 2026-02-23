import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MessageSquareQuote } from 'lucide-react';
import '../App.css';

const SENTIMENT_STYLES = {
    GOOD: { label: 'Good', color: '#16a34a', bg: '#ecfdf5' },
    NEUTRAL: { label: 'Neutral', color: '#f59e0b', bg: '#fffbeb' },
    BAD: { label: 'Bad', color: '#ef4444', bg: '#fef2f2' }
};

// Change this value to your preferred note background color.
const CUSTOM_FEEDBACK_BG = '#fff7cc';

const shuffle = (items) => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const getSentimentKey = (feedback) => {
    const type = String(feedback.feedback_type || '').trim().toUpperCase();
    if (type === 'POSITIVE') return 'GOOD';
    if (type === 'NEUTRAL') return 'NEUTRAL';
    if (type === 'NEGATIVE') return 'BAD';

    const rating = Number(feedback.rating) || 0;
    if (rating >= 4) return 'GOOD';
    if (rating <= 2) return 'BAD';
    return 'NEUTRAL';
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
};

const decorateNotes = (items) =>
    items.map((item) => ({
        ...item,
        _tilt: (Math.random() * 8) - 4,
        _offset: Math.floor(Math.random() * 20),
        _bg: CUSTOM_FEEDBACK_BG
    }));

const AdminFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setLoading(true);
                const res = await API.get('/issues/admin/feedbacks');
                const list = Array.isArray(res.data) ? res.data : [];
                setFeedbacks(decorateNotes(shuffle(list)));
            } catch (err) {
                console.error('Error fetching feedbacks:', err);
                setFeedbacks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: '#94a3b8' }}>Loading feedbacks...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.headerTitleWrap}>
                    <MessageSquareQuote size={28} color="#2563eb" />
                    <h1 style={styles.title}>Resolver Feedbacks</h1>
                </div>
                <p style={styles.subtitle}>{feedbacks.length} feedback notes</p>
            </div>

            {feedbacks.length === 0 ? (
                <div style={styles.emptyState}>No feedbacks available.</div>
            ) : (
                <div style={styles.board}>
                    {feedbacks.map((feedback) => {
                        const sentimentKey = getSentimentKey(feedback);
                        const sentiment = SENTIMENT_STYLES[sentimentKey];

                        return (
                            <article
                                key={feedback.id}
                                style={{
                                    ...styles.note,
                                    borderLeftColor: sentiment.color,
                                    backgroundColor: feedback._bg,
                                    transform: `rotate(${feedback._tilt || 0}deg)`,
                                    marginTop: `${feedback._offset || 0}px`
                                }}
                            >
                                <div style={styles.noteTop}>
                                    <div style={styles.peopleLine}>
                                        <span style={styles.from}>{feedback.from}</span>
                                        <span style={styles.to}>to {feedback.to || 'Unassigned'}</span>
                                    </div>
                                    <div
                                        style={{
                                            ...styles.badge,
                                            color: sentiment.color,
                                            backgroundColor: sentiment.bg
                                        }}
                                    >
                                        <span style={{ ...styles.dot, backgroundColor: sentiment.color }} />
                                        {sentiment.label}
                                    </div>
                                </div>

                                <p style={styles.noteComment}>{feedback.comment || 'No comment provided.'}</p>

                                <div style={styles.noteMeta}>
                                    <span>Issue #{feedback.id}</span>
                                    <span>{formatDate(feedback.created_at)}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const styles = {
    page: {
        padding: '20px'
    },
    header: {
        marginBottom: '18px'
    },
    headerTitleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    title: {
        margin: 0,
        fontSize: '28px',
        color: '#1e293b'
    },
    subtitle: {
        margin: '8px 0 0 0',
        color: '#64748b',
        fontSize: '14px'
    },
    board: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '14px',
        alignItems: 'start'
    },
    note: {
        borderRadius: '6px',
        border: '1px solid rgba(15, 23, 42, 0.1)',
        borderLeft: '5px solid',
        padding: '14px 16px',
        minHeight: '170px',
        boxShadow: '0 8px 16px rgba(15, 23, 42, 0.18)',
        transition: 'transform 0.2s ease'
    },
    noteTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        flexWrap: 'wrap'
    },
    peopleLine: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
        minWidth: 0
    },
    from: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a'
    },
    to: {
        fontSize: '13px',
        color: '#64748b'
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '700'
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%'
    },
    noteComment: {
        margin: '12px 0 10px 0',
        color: '#334155',
        fontSize: '14px',
        lineHeight: 1.5
    },
    noteMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(15, 23, 42, 0.1)',
        paddingTop: '8px',
        color: '#64748b',
        fontSize: '12px',
        fontWeight: '600'
    },
    emptyState: {
        padding: '26px',
        textAlign: 'center',
        color: '#64748b',
        border: '1px dashed #cbd5e1',
        borderRadius: '12px',
        backgroundColor: '#ffffff'
    }
};

export default AdminFeedbacks;
