import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { label: 'Dashboard', path: '/user-dashboard' },
        { label: 'Raise Issue', path: '/user/raise' },
        { label: 'My Issues', path: '/user/all-issues' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header style={styles.navbar}>
            <div style={styles.inner}>
                <div style={styles.leftGroup}>
                    <h2 style={styles.brand}>Issue Tracker</h2>
                    <nav style={styles.navLinks}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    ...styles.link,
                                    ...(location.pathname === item.path ? styles.activeLink : {})
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div style={styles.rightGroup}>
                    <span style={styles.welcome}>Welcome, {user?.name || 'User'}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>
        </header>
    );
};

const styles = {
    navbar: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50
    },
    inner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
    },
    leftGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
    },
    brand: {
        margin: 0,
        fontSize: '20px',
        color: '#1e293b'
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    link: {
        padding: '8px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#475569',
        fontWeight: '600',
        fontSize: '14px'
    },
    activeLink: {
        backgroundColor: '#dbeafe',
        color: '#1d4ed8'
    },
    rightGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    welcome: {
        color: '#334155',
        fontSize: '14px',
        fontWeight: '500'
    },
    logoutBtn: {
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#ef4444',
        color: '#ffffff',
        padding: '8px 12px',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default Navbar;
