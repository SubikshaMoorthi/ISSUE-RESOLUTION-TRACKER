import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    UserPlus, 
    BarChart3, 
    PlusCircle, 
    ListTodo, 
    LogOut, 
    Users, 
    MessageSquareQuote,
    CheckCircle,
    MessageCircle
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Configuration for Admin, Resolver, and User menus
    const menuConfig = {
        ROLE_ADMIN: [
            { name: "Dashboard", path: "/admin/performance", icon: <BarChart3 size={20} /> },
            { name: "Add Users", path: "/admin/add-user", icon: <UserPlus size={20} /> },
            { name: "Users Info", path: "/admin/users", icon: <Users size={20} /> },
            { name: "Issue Log", path: "/admin/all-issues", icon: <ListTodo size={20} /> },
            { name: "Feedbacks", path: "/admin/feedbacks", icon: <MessageSquareQuote size={20} /> },
        ],
        ROLE_RESOLVER: [
            { name: "Dashboard", path: "/resolver-dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Assigned Issues", path: "/resolver/assigned", icon: <ListTodo size={20} /> },
            { name: "Resolved Issues", path: "/resolver/resolved", icon: <CheckCircle size={20} /> },
            { name: "Feedbacks", path: "/resolver/feedbacks", icon: <MessageCircle size={20} /> },
        ],
        ROLE_USER: [
            { name: "Dashboard", path: "/user-dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Raise Issue", path: "/user/raise", icon: <PlusCircle size={20} /> },
            { name: "My Issues", path: "/user/all-issues", icon: <ListTodo size={20} /> },
        ]
    };

    const currentLinks = menuConfig[user?.role] || [];

    return (
        <div style={styles.sidebar}>
            <div style={styles.logoSection}>
                <h2 style={styles.logoText}>Issue Tracker</h2>
            </div>

            {/* User Welcome Section */}
            <div style={styles.welcomeSection}>
                <p style={styles.welcomeText}>Welcome back,</p>
                <p style={styles.userName}>{user?.name}!</p>
            </div>

            <nav style={{ flex: 1, marginTop: '20px' }}>
                {currentLinks.map((item) => (
                    <Link 
                        key={item.path} 
                        to={item.path} 
                        style={{
                            ...styles.navLink,
                            backgroundColor: location.pathname === item.path ? '#334155' : 'transparent',
                            color: location.pathname === item.path ? '#60a5fa' : '#cbd5e1'
                        }}
                    >
                        {item.icon} 
                        <span style={{ marginLeft: '12px' }}>{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout at bottom */}
            <button onClick={handleLogout} style={styles.logoutBtnBottom}>
                <LogOut size={18} />
                <span style={{ marginLeft: '10px' }}>Logout</span>
            </button>
        </div>
    );
};

const styles = {
    sidebar: { 
        width: '260px', 
        height: '100vh', 
        backgroundColor: '#1e293b', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        left: 0, 
        top: 0 
    },
    logoSection: { 
        padding: '20px', 
        textAlign: 'center', 
        borderBottom: '1px solid #334155' 
    },
    logoText: { 
        color: '#f8fafc', 
        fontFamily: 'serif', 
        fontSize: '24px', 
        letterSpacing: '1px',
        margin: 0
    },
    welcomeSection: {
        padding: '20px',
        borderBottom: '1px solid #334155',
        backgroundColor: '#0f172a'
    },
    welcomeText: {
        color: '#94a3b8',
        fontSize: '12px',
        margin: '0 0 4px 0',
        fontWeight: '500'
    },
    userName: {
        color: '#f8fafc',
        fontSize: '18px',
        fontWeight: '700',
        margin: 0
    },
    logoutBtnBottom: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '14px 16px',
        backgroundColor: '#7f1d1d',
        color: '#fca5a5',
        border: '1px solid #dc2626',
        borderRadius: '0',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s',
        borderTop: '1px solid #334155'
    },
    navLink: { 
        display: 'flex', 
        alignItems: 'center', 
        padding: '14px 25px', 
        textDecoration: 'none', 
        fontSize: '15px',
        transition: 'all 0.2s'
    }
};

export default Sidebar;