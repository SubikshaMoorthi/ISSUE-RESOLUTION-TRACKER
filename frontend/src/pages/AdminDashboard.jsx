import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminPerformance = () => {
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [deptChartData, setDeptChartData] = useState(null);
    const [ratingChartData, setRatingChartData] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get('/issues/admin/stats');
                const { stats: statusArray, deptStats, resolverRatings } = res.data;

                setStats({
                    total: statusArray.reduce((acc, curr) => acc + curr.count, 0),
                    resolved: statusArray.find(d => d.status === 'RESOLVED')?.count || 0,
                    pending: statusArray.find(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS')?.count || 0
                });

                setDeptChartData({
                    labels: deptStats.map(d => d.label),
                    datasets: [{
                        data: deptStats.map(d => d.count),
                        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
                    }]
                });

                setRatingChartData({
                    labels: resolverRatings.map(r => r.label),
                    datasets: [{
                        data: resolverRatings.map(r => r.count),
                        backgroundColor: ['#4b49ac', '#24d271', '#f3a23a', '#00c3da'],
                    }]
                });
            } catch (err) {
                console.error("Error loading dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

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
        </div>
    );
};

const styles = {
    statsRow: { display: 'flex', gap: '25px', marginBottom: '40px' },
    curvedCard: { flex: 1, padding: '35px 20px', borderRadius: '40px', color: 'white', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    cardLabel: { fontSize: '16px', fontWeight: '500', opacity: 0.9, marginBottom: '10px' },
    cardValue: { fontSize: '42px', fontWeight: '800' },
    chartSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    chartContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    chartHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }
};

export default AdminPerformance;