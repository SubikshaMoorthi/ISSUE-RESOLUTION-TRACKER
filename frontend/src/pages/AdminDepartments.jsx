import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Building2, Users, CheckCircle2, Star } from 'lucide-react';

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [flippedDepartments, setFlippedDepartments] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                const res = await API.get('/issues/admin/departments');
                const list = Array.isArray(res?.data?.departments) ? res.data.departments : [];
                setDepartments(list);
            } catch (err) {
                console.error('Error loading departments', err);
                setDepartments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const toggleDepartmentFlip = (department) => {
        setFlippedDepartments((prev) => ({
            ...prev,
            [department]: !prev[department]
        }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading departments...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                    Departments
                </h1>
                <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px' }}>
                    Click a card to view department performance details
                </p>
            </div>

            <div style={styles.departmentGrid}>
                {departments.map((dept) => {
                    const isFlipped = Boolean(flippedDepartments[dept.department]);
                    const avgRatingText = dept.avgRating === null ? '-' : Number(dept.avgRating).toFixed(2);

                    return (
                        <button
                            key={dept.department}
                            type="button"
                            onClick={() => toggleDepartmentFlip(dept.department)}
                            style={styles.flipCard}
                        >
                            <div
                                style={{
                                    ...styles.flipCardInner,
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                <div style={styles.flipCardFront}>
                                    <Building2 size={24} color="#1d4ed8" />
                                    <h4 style={styles.departmentName}>{dept.department}</h4>
                                </div>

                                <div style={styles.flipCardBack}>
                                    <h4 style={styles.backTitle}>{dept.department}</h4>
                                    <div style={styles.metricRow}>
                                        <Users size={15} color="#0f172a" />
                                        <span style={styles.metricLabel}>Members:</span>
                                        <strong>{dept.members}</strong>
                                    </div>
                                    <div style={styles.metricRow}>
                                        <CheckCircle2 size={15} color="#0f172a" />
                                        <span style={styles.metricLabel}>Issues Solved:</span>
                                        <strong>{dept.solvedIssues}</strong>
                                    </div>
                                    <div style={styles.metricRow}>
                                        <Star size={15} color="#0f172a" />
                                        <span style={styles.metricLabel}>Avg Rating:</span>
                                        <strong>{avgRatingText}</strong>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const styles = {
    departmentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px'
    },
    flipCard: {
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        padding: 0,
        height: '180px',
        perspective: '1000px'
    },
    flipCardInner: {
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d'
    },
    flipCardFront: {
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        borderRadius: '14px',
        border: '1px solid #dbeafe',
        background: 'linear-gradient(145deg, #eff6ff, #dbeafe)',
        boxShadow: '0 6px 14px -10px rgba(15,23,42,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    },
    flipCardBack: {
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        boxShadow: '0 6px 14px -10px rgba(15,23,42,0.7)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '10px'
    },
    departmentName: {
        margin: 0,
        color: '#0f172a',
        fontSize: '20px',
        letterSpacing: '0.3px'
    },
    backTitle: {
        margin: '0 0 6px 0',
        color: '#1e293b',
        fontSize: '16px',
        textAlign: 'left'
    },
    metricRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#334155',
        fontSize: '13px'
    },
    metricLabel: {
        minWidth: '92px',
        textAlign: 'left'
    }
};

export default AdminDepartments;
