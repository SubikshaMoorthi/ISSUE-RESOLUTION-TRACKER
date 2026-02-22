import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { BarChart3, CheckCircle, Clock, ListTodo } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ResolverDashboard = () => {
    const { user } = useContext(AuthContext);
    const resolverId = user?.userId || user?.id;
    const [stats, setStats] = useState({
        stats: { total_assigned: 0, resolved: 0, pending: 0 },
        ratingData: { avg_rating: 0, total_ratings: 0 },
        departmentRankings: [],
        ratingDistribution: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResolverStats = async () => {
            try {
                if (!resolverId) {
                    setError('Resolver account not found. Please login again.');
                    return;
                }
                setError('');
                const res = await API.get(`/issues/resolver/${resolverId}/stats`);
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching resolver stats:', err);
                setError(err?.response?.data?.message || 'Failed to load resolver dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchResolverStats();
    }, [resolverId]);

    if (loading) {
        return <div style={styles.page}>Loading...</div>;
    }

    const resolverRank = stats.departmentRankings?.findIndex(
        (r) => Number(r.id) === Number(resolverId)
    ) + 1 || '-';
    const ratingDistributionData = stats.ratingDistribution || [];
    const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    const formatAvgRating = (value) => {
        const n = Number(value);
        return Number.isFinite(n) && n > 0 ? n.toFixed(1) : null;
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>Resolver Dashboard</h1>
                <p style={styles.subtitle}>{user?.department || 'Resolver'} Department</p>
            </div>

            {error && (
                <div style={styles.errorBox}>
                    <p style={styles.errorText}>{error}</p>
                </div>
            )}

            <div style={styles.summaryGrid}>
                <SummaryCard
                    label="Total Issues"
                    value={stats.stats.total_assigned}
                    icon={<ListTodo size={20} color="#3730a3" />}
                    backgroundColor="#e0e7ff"
                    iconBg="#c7d2fe"
                />
                <SummaryCard
                    label="Resolved Issues"
                    value={stats.stats.resolved}
                    icon={<CheckCircle size={20} color="#166534" />}
                    backgroundColor="#dcfce7"
                    iconBg="#bbf7d0"
                />
                <SummaryCard
                    label="Pending Issues"
                    value={stats.stats.pending}
                    icon={<Clock size={20} color="#92400e" />}
                    backgroundColor="#fef3c7"
                    iconBg="#fde68a"
                />
                <SummaryCard
                    label="Assigned Issues"
                    value={stats.stats.total_assigned}
                    icon={<BarChart3 size={20} color="#9f1239" />}
                    backgroundColor="#ffe4e6"
                    iconBg="#fecdd3"
                />
            </div>

            <div style={styles.chartsGrid}>
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Department Rankings</h3>
                    <p style={styles.chartSubtitle}>
                        Your position: #{resolverRank} of {stats.departmentRankings?.length || 0}
                    </p>
                    <div style={styles.chartContainer}>
                        {stats.departmentRankings && stats.departmentRankings.length > 0 ? (
                            <div style={styles.rankingsList}>
                                {stats.departmentRankings.map((resolver, index) => {
                                    const avgRatingLabel = formatAvgRating(resolver.avg_rating);
                                    const isCurrentResolver = Number(resolver.id) === Number(resolverId);
                                    return (
                                        <div
                                            key={resolver.id}
                                            style={{
                                                ...styles.rankingItem,
                                                backgroundColor: isCurrentResolver ? '#e0e7ff' : 'transparent',
                                                borderLeft: isCurrentResolver ? '4px solid #4f46e5' : '4px solid transparent'
                                            }}
                                        >
                                            <div style={styles.rankingRank}>#{index + 1}</div>
                                            <div style={styles.rankingInfo}>
                                                <p style={styles.rankingName}>{resolver.name}</p>
                                                <p style={styles.rankingSubinfo}>
                                                    {resolver.total_resolved || 0} resolved
                                                    {avgRatingLabel && ` | ${avgRatingLabel} stars`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={styles.noData}>No ranking data available</p>
                        )}
                    </div>
                </div>

                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Rating Distribution</h3>
                    <p style={styles.chartSubtitle}>Your feedback ratings</p>
                    <div style={styles.chartContainer}>
                        {ratingDistributionData && ratingDistributionData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={ratingDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="count"
                                        >
                                            {ratingDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value} ratings`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={styles.legendContainer}>
                                    {ratingDistributionData.map((item, index) => (
                                        <div key={index} style={styles.legendItem}>
                                            <div
                                                style={{
                                                    ...styles.legendColor,
                                                    backgroundColor: COLORS[index % COLORS.length]
                                                }}
                                            ></div>
                                            <span style={styles.legendLabel}>{item.name}: {item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p style={styles.noData}>No rating data available</p>
                        )}
                    </div>
                </div>
            </div>
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
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
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
        margin: '0 0 8px 0',
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b'
    },
    cardValue: {
        margin: 0,
        fontSize: '38px',
        lineHeight: 1,
        fontWeight: '800',
        color: '#1e293b'
    },
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '16px'
    },
    chartCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 10px 20px -18px rgba(15, 23, 42, 0.8)'
    },
    chartTitle: {
        margin: '0 0 4px 0',
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b'
    },
    chartSubtitle: {
        margin: '0 0 16px 0',
        fontSize: '12px',
        color: '#64748b'
    },
    chartContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '250px'
    },
    rankingsList: {
        width: '100%'
    },
    rankingItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        marginBottom: '8px',
        borderRadius: '8px',
        transition: 'background-color 0.2s'
    },
    rankingRank: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#4f46e5',
        minWidth: '40px',
        textAlign: 'center'
    },
    rankingInfo: {
        flex: 1
    },
    rankingName: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
    },
    rankingSubinfo: {
        margin: 0,
        fontSize: '12px',
        color: '#64748b'
    },
    legendContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px',
        marginTop: '16px'
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#64748b'
    },
    legendColor: {
        width: '12px',
        height: '12px',
        borderRadius: '2px'
    },
    legendLabel: {
        fontSize: '12px'
    },
    noData: {
        textAlign: 'center',
        color: '#64748b',
        margin: 0
    },
    errorBox: {
        marginBottom: '18px',
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca'
    },
    errorText: {
        margin: 0,
        color: '#991b1b',
        fontSize: '14px',
        fontWeight: '600'
    }
};

export default ResolverDashboard;
