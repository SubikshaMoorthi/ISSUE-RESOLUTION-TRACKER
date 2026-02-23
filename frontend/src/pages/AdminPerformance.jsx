import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Users } from 'lucide-react';

const AdminPerformance = () => {
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, totalUsers: 0 });
    const [deptData, setDeptData] = useState([]);
    const [resolverRatings, setResolverRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const fetchPerformanceData = async () => {
        try {
            const res = await API.get('/issues/admin/stats');
            const {
                stats: statusStats = [],
                deptStats = [],
                resolverRatings: ratingsData = [],
                totalUsers = 0
            } = res.data || {};

            const safeStatusStats = Array.isArray(statusStats) ? statusStats : [];
            const safeDeptStats = Array.isArray(deptStats) ? deptStats : [];
            const safeRatingsData = Array.isArray(ratingsData) ? ratingsData : [];

            const totalCount = safeStatusStats.reduce((acc, curr) => acc + curr.count, 0);
            const resolvedCount = safeStatusStats.find((d) => d.status === 'RESOLVED')?.count || 0;
            const pendingCount = safeStatusStats
                .filter((d) => d.status === 'OPEN' || d.status === 'IN_PROGRESS')
                .reduce((acc, curr) => acc + curr.count, 0);

            setStats({
                total: totalCount,
                resolved: resolvedCount,
                pending: pendingCount,
                totalUsers: totalUsers || 0
            });

            setDeptData(safeDeptStats.map((d, idx) => ({
                name: d.label,
                value: d.count,
                color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6]
            })));

            setResolverRatings(safeRatingsData);
        } catch (err) {
            console.error('Error fetching stats', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                    Dashboard
                </h1>
                <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px' }}>
                    System Performance Overview
                </p>
            </div>

            <div style={styles.statsContainer}>
                <StatCard
                    icon={<TrendingUp size={24} color="#2563eb" />}
                    title="Total Issues"
                    value={stats.total}
                    bgColor="#dbeafe"
                />
                <StatCard
                    icon={<CheckCircle size={24} color="#10b981" />}
                    title="Resolved Issues"
                    value={stats.resolved}
                    bgColor="#dcfce7"
                />
                <StatCard
                    icon={<AlertCircle size={24} color="#f59e0b" />}
                    title="Pending Issues"
                    value={stats.pending}
                    bgColor="#fef3c7"
                />
                <StatCard
                    icon={<Users size={24} color="#8b5cf6" />}
                    title="Total Users"
                    value={stats.totalUsers}
                    bgColor="#f3e8ff"
                />
            </div>

            <div style={styles.chartsContainer}>
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Department-wise Issues</h3>
                    {deptData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={deptData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                    dataKey="value"
                                >
                                    {deptData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} issues`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No data available</p>
                    )}
                </div>

                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Resolver Ratings Distribution</h3>
                    {resolverRatings.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={resolverRatings}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="count"
                                    label={({ name, count }) => `${name}: ${count}`}
                                    labelLine={false}
                                >
                                    {resolverRatings.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'][index % 5]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} resolvers`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, bgColor }) => (
    <div style={{ ...styles.card, backgroundColor: bgColor }}>
        <div style={styles.cardIcon}>{icon}</div>
        <div>
            <p style={styles.cardTitle}>{title}</p>
            <p style={styles.cardValue}>{value}</p>
        </div>
    </div>
);

const styles = {
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    card: {
        padding: '24px',
        borderRadius: '12px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
    },
    cardIcon: {
        padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: '8px'
    },
    cardTitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0,
        fontWeight: '500'
    },
    cardValue: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '8px 0 0 0'
    },
    chartsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
    },
    chartTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 16px 0'
    }
};

export default AdminPerformance;
