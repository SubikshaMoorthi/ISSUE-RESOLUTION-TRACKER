import { X, Calendar, User, Tag, MessageSquare } from 'lucide-react';

const IssueModal = ({ issue, onClose, onMarkResolved }) => {
    if (!issue) return null;
    const isResolved = String(issue.status || '').toUpperCase() === 'RESOLVED';

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RESOLVED': return '#16a34a';
            case 'IN_PROGRESS': return '#ca8a04';
            case 'OPEN': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>{issue.title}</h2>
                    <button
                        onClick={onClose}
                        style={styles.closeBtn}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Status Badge */}
                    <div style={styles.statusContainer}>
                        <span
                            style={{
                                ...styles.statusBadge,
                                backgroundColor: getStatusColor(issue.status),
                                opacity: 0.8
                            }}
                        >
                            {issue.status}
                        </span>
                        {issue.category && (
                            <span style={styles.categoryBadge}>
                                <Tag size={14} style={{ marginRight: '4px' }} />
                                {issue.category}
                            </span>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div style={styles.detailsGrid}>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>
                                <User size={16} />
                                Created By
                            </div>
                            <div style={styles.detailValue}>{issue.reporter_name || 'Unknown'}</div>
                        </div>

                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>
                                <Calendar size={16} />
                                Date Created
                            </div>
                            <div style={styles.detailValue}>{formatDate(issue.created_at)}</div>
                        </div>

                        {issue.updated_at && (
                            <div style={styles.detailRow}>
                                <div style={styles.detailLabel}>
                                    <Calendar size={16} />
                                    Last Updated
                                </div>
                                <div style={styles.detailValue}>{formatDate(issue.updated_at)}</div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div style={styles.descriptionSection}>
                        <h3 style={styles.sectionTitle}>
                            <MessageSquare size={16} />
                            Description
                        </h3>
                        <p style={styles.description}>
                            {issue.description || 'No description provided'}
                        </p>
                    </div>

                    {/* Feedback Section (if available) */}
                    {issue.feedback_text && (
                        <div style={styles.feedbackSection}>
                            <h3 style={styles.sectionTitle}>Feedback</h3>
                            <div style={styles.feedbackBox}>
                                <p style={styles.feedback}>{issue.feedback_text}</p>
                                {issue.rating && (
                                    <div style={styles.ratingContainer}>
                                        <span style={styles.rating}>
                                            {'*'.repeat(Math.round(issue.rating))}
                                        </span>
                                        <span style={styles.ratingValue}>({issue.rating.toFixed(1)}/5)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Action Buttons */}
                {!isResolved && onMarkResolved && (
                    <div style={styles.footer}>
                        <button
                            onClick={onClose}
                            style={styles.cancelBtn}
                        >
                            Close
                        </button>
                        <button
                            onClick={() => onMarkResolved(issue.id)}
                            style={styles.resolveBtn}
                        >
                            Mark as Resolved
                        </button>
                    </div>
                )}
                {isResolved && (
                    <div style={styles.footer}>
                        <button
                            onClick={onClose}
                            style={styles.cancelBtn}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        paddingTop: '60px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        backgroundColor: '#f8fafc'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        flex: 1
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.2s'
    },
    content: {
        padding: '24px',
        flex: 1
    },
    statusContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },
    statusBadge: {
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    categoryBadge: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: '#e0e7ff',
        color: '#4f46e5',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
    },
    detailRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    detailLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase'
    },
    detailValue: {
        fontSize: '14px',
        color: '#1e293b',
        fontWeight: '500'
    },
    descriptionSection: {
        marginBottom: '20px'
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
    },
    description: {
        margin: 0,
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        color: '#475569',
        lineHeight: '1.6',
        border: '1px solid #e2e8f0'
    },
    feedbackSection: {
        marginBottom: '16px'
    },
    feedbackBox: {
        padding: '12px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px'
    },
    feedback: {
        margin: '0 0 12px 0',
        color: '#15803d',
        lineHeight: '1.6'
    },
    ratingContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    rating: {
        fontSize: '16px'
    },
    ratingValue: {
        fontSize: '12px',
        color: '#65a30d'
    },
    footer: {
        display: 'flex',
        gap: '12px',
        padding: '16px 24px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        justifyContent: 'flex-end'
    },
    cancelBtn: {
        padding: '10px 16px',
        backgroundColor: '#e2e8f0',
        color: '#1e293b',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'background-color 0.2s'
    },
    resolveBtn: {
        padding: '10px 16px',
        backgroundColor: '#16a34a',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'background-color 0.2s'
    }
};

export default IssueModal;
