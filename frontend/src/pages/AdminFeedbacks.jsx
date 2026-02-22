import { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { MessageSquareQuote } from 'lucide-react';
import '../App.css';

const BOARD_COLUMNS = [
    { key: 'good', title: 'Good', accent: '#22c55e', bg: '#ecfdf5' },
    { key: 'bad', title: 'Bad', accent: '#ef4444', bg: '#fef2f2' },
    { key: 'ideas', title: 'Ideas', accent: '#f59e0b', bg: '#fffbeb' }
];

const NOTE_COLORS = ['#fef3c7', '#dbeafe', '#dcfce7', '#fee2e2', '#ede9fe', '#fce7f3'];

const AdminFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await API.get('/issues/admin/feedbacks');
            setFeedbacks(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    const groupedFeedbacks = useMemo(() => {
        const groups = { good: [], bad: [], ideas: [] };

        feedbacks.forEach((feedback) => {
            const rating = Number(feedback.rating) || 0;
            const comment = (feedback.comment || '').toLowerCase();
            const hasIdeaHint = ['should', 'could', 'improve', 'suggest', 'idea', 'recommend']
                .some((word) => comment.includes(word));

            if (rating >= 4 && !hasIdeaHint) {
                groups.good.push(feedback);
            } else if (rating <= 2) {
                groups.bad.push(feedback);
            } else {
                groups.ideas.push(feedback);
            }
        });

        return groups;
    }, [feedbacks]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: '#94a3b8' }}>Loading feedback board...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.headerTitleWrap}>
                    <MessageSquareQuote size={30} color="#2563eb" />
                    <h1 style={styles.title}>Resolver Feedback Board</h1>
                </div>
                <p style={styles.subtitle}>{feedbacks.length} feedback notes</p>
            </div>

            <div style={styles.board}>
                {BOARD_COLUMNS.map((column) => (
                    <section
                        key={column.key}
                        style={{
                            ...styles.column,
                            backgroundColor: column.bg,
                            borderColor: column.accent
                        }}
                    >
                        <div style={styles.columnHeader}>
                            <h2 style={{ ...styles.columnTitle, color: column.accent }}>{column.title}</h2>
                            <span style={{ ...styles.countBadge, backgroundColor: column.accent }}>
                                {groupedFeedbacks[column.key].length}
                            </span>
                        </div>

                        <div style={styles.notesList}>
                            {groupedFeedbacks[column.key].length > 0 ? (
                                groupedFeedbacks[column.key].map((feedback, idx) => (
                                    <StickyNote key={feedback.id} feedback={feedback} idx={idx} />
                                ))
                            ) : (
                                <div style={styles.emptyColumn}>No notes</div>
                            )}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

const StickyNote = ({ feedback, idx }) => {
    const rotation = (idx % 2 === 0 ? -1 : 1) * (2 + (idx % 3));
    const color = NOTE_COLORS[idx % NOTE_COLORS.length];

    return (
        <article style={{ ...styles.note, backgroundColor: color, transform: `rotate(${rotation}deg)` }}>
            <p style={styles.noteFrom}>
                {feedback.from} -> {feedback.to || 'Unassigned'}
            </p>
            <p style={styles.noteComment}>{feedback.comment || 'No comment provided.'}</p>
            <div style={styles.noteFooter}>
                <span style={styles.noteRating}>{renderStars(feedback.rating)}</span>
                <span style={styles.noteDate}>{formatDate(feedback.created_at)}</span>
            </div>
        </article>
    );
};

const renderStars = (rating) => {
    const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    if (safeRating === 0) return 'No rating';
    return '★'.repeat(safeRating);
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

const styles = {
    page: {
        padding: '20px'
    },
    header: {
        marginBottom: '20px'
    },
    headerTitleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    title: {
        margin: 0,
        fontSize: '30px',
        color: '#1e293b'
    },
    subtitle: {
        margin: '8px 0 0 0',
        color: '#64748b',
        fontSize: '14px'
    },
    board: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
    },
    column: {
        border: '1px solid',
        borderRadius: '14px',
        padding: '14px',
        minHeight: '560px'
    },
    columnHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
    },
    columnTitle: {
        margin: 0,
        fontSize: '22px',
        fontWeight: '800'
    },
    countBadge: {
        color: '#ffffff',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 10px'
    },
    notesList: {
        display: 'grid',
        gap: '14px'
    },
    note: {
        borderRadius: '4px',
        boxShadow: '0 8px 14px rgba(15, 23, 42, 0.16)',
        padding: '14px',
        minHeight: '170px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        transition: 'transform 0.2s ease'
    },
    noteFrom: {
        margin: 0,
        color: '#0f172a',
        fontWeight: '700',
        fontSize: '13px'
    },
    noteComment: {
        margin: '10px 0 12px 0',
        color: '#334155',
        fontSize: '14px',
        lineHeight: 1.5
    },
    noteFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto'
    },
    noteRating: {
        color: '#b45309',
        fontWeight: '700',
        fontSize: '13px'
    },
    noteDate: {
        color: '#475569',
        fontSize: '12px',
        fontWeight: '600'
    },
    emptyColumn: {
        padding: '24px 10px',
        textAlign: 'center',
        color: '#64748b',
        border: '1px dashed #cbd5e1',
        borderRadius: '10px',
        backgroundColor: '#ffffff'
    }
};

export default AdminFeedbacks;
