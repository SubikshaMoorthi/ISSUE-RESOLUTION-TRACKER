import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart3, PieChart as PieIcon, Building2, Users, CheckCircle2, Star } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminPerformance = () => {
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [deptChartData, setDeptChartData] = useState(null);
    const [ratingChartData, setRatingChartData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [flippedDepartments, setFlippedDepartments] = useState({});

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, departmentsRes] = await Promise.all([
                    API.get('/issues/admin/stats'),
                    API.get('/issues/admin/departments')
                ]);

                const { stats: statusArray, deptStats, resolverRatings } = statsRes.data;
                const departmentCards = Array.isArray(departmentsRes?.data?.departments)
                    ? departmentsRes.data.departments
                    : [];

                setStats({
                    total: statusArray.reduce((acc, curr) => acc + curr.count, 0),
                    resolved: statusArray.find(d => d.status === 'RESOLVED')?.count || 0,
                    pending: statusArray.find(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS')?.count || 0
                });

                setDeptChartData({
                    labels: deptStats.map(d => d.label),
                    datasets: [{
                        data: deptStats.map(d => d.count),
                        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'],
                    }]
                });

                setRatingChartData({
                    labels: resolverRatings.map(r => r.label),
                    datasets: [{
                        data: resolverRatings.map(r => r.count),
                        backgroundColor: ['#4b49ac', '#24d271', '#f3a23a', '#00c3da'],
                    }]
                });

                setDepartments(departmentCards);
            } catch (err) {
                console.error("Error loading dashboard stats", err);
            }
        };
        fetchDashboardData();
    }, []);

    const toggleDepartmentFlip = (department) => {
        setFlippedDepartments((prev) => ({
            ...prev,
            [department]: !prev[department]
        }));
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <BarChart3 size={28} color="#4f46e5" />
                <h2 style={{ marginLeft: '10px' }}>Performance Analytics</h2>
            </div>

            {/* CURVED STAT BOXES */}
            <div style={styles.statsRow}>
                <div style={{ ...styles.curvedCard, background: '#4f46e5' }}>
                    <p style={styles.cardLabel}>Total Issues</p>
                    <h2 style={styles.cardValue}>{stats.total}</h2>
                </div>
                <div style={{ ...styles.curvedCard, background: '#10b981' }}>
                    <p style={styles.cardLabel}>Solved Issues</p>
                    <h2 style={styles.cardValue}>{stats.resolved}</h2>
                </div>
                <div style={{ ...styles.curvedCard, background: '#f59e0b' }}>
                    <p style={styles.cardLabel}>Pending Issues</p>
                    <h2 style={styles.cardValue}>{stats.pending}</h2>
                </div>
            </div>

            {/* PIE CHARTS SECTION */}
            <div style={styles.chartSection}>
                <div style={styles.chartContainer}>
                    <div style={styles.chartHeader}>
                        <PieIcon size={20} color="#64748b" />
                        <h3 style={{ marginLeft: '10px' }}>Issues by Department</h3>
                    </div>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        {deptChartData && <Pie data={deptChartData} />}
                    </div>
                </div>

                <div style={styles.chartContainer}>
                    <div style={styles.chartHeader}>
                        <PieIcon size={20} color="#64748b" />
                        <h3 style={{ marginLeft: '10px' }}>Resolver Performance (Ratings)</h3>
                    </div>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        {ratingChartData && <Pie data={ratingChartData} />}
                    </div>
                </div>
            </div>

            <div style={styles.departmentSection}>
                <div style={styles.sectionHeader}>
                    <Building2 size={22} color="#2563eb" />
                    <h3 style={styles.sectionTitle}>Department Insights</h3>
                </div>
                <p style={styles.sectionSubtitle}>Click any department card to view performance details</p>

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
                                        <Building2 size={22} color="#1d4ed8" />
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
        </div>
    );
};

const styles = {
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', marginBottom: '40px' },
    curvedCard: { flex: 1, padding: '35px 20px', borderRadius: '40px', color: 'white', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    cardLabel: { fontSize: '16px', fontWeight: '500', opacity: 0.9, marginBottom: '10px' },
    cardValue: { fontSize: '42px', fontWeight: '800' },
    chartSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
    chartContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    chartHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
    departmentSection: {
        marginTop: '34px',
        backgroundColor: '#ffffff',
        padding: '22px',
        borderRadius: '18px',
        boxShadow: '0 4px 10px -3px rgba(15,23,42,0.12)'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    sectionTitle: {
        margin: 0,
        color: '#0f172a',
        fontSize: '20px'
    },
    sectionSubtitle: {
        margin: '8px 0 16px 0',
        color: '#64748b',
        fontSize: '13px'
    },
    departmentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
    },
    flipCard: {
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        padding: 0,
        height: '170px',
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

export default AdminPerformance;
