import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, UserPlus, BarChart3, PlusCircle, ListTodo, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const menuConfig = {
        ROLE_ADMIN: [
            { name: "Dashboard", path: "/admin-dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Add User/Resolver", path: "/admin/add-user", icon: <UserPlus size={20} /> },
            { name: "Performance", path: "/admin/performance", icon: <BarChart3 size={20} /> },
        ],
        ROLE_RESOLVER: [
            { name: "Dashboard", path: "/resolver-dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Assigned Issues", path: "/resolver/tasks", icon: <ListTodo size={20} /> },
        ],
        ROLE_USER: [
            { name: "Dashboard", path: "/user-dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Raise Issue", path: "/user/raise", icon: <PlusCircle size={20} /> },
            { name: "All Issues", path: "/user/all-issues", icon: <ListTodo size={20} /> },
        ]
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logoSection}>
                <h2 style={styles.logoText}>Issue Tracker</h2>
            </div>
            <div style={styles.roleLabel}>{user?.role?.split('_')[1]}</div>
            <nav style={{ flex: 1 }}>
                {menuConfig[user?.role]?.map((item) => (
                    <Link key={item.path} to={item.path} style={{
                        ...styles.navLink,
                        backgroundColor: location.pathname === item.path ? '#334155' : 'transparent'
                    }}>
                        {item.icon} <span style={{ marginLeft: '12px' }}>{item.name}</span>
                    </Link>
                ))}
            </nav>
            <button onClick={() => { logout(); navigate('/'); }} style={styles.logoutBtn}>
                <LogOut size={20} color="#f87171" />
                <span style={{ marginLeft: '12px', color: '#f87171' }}>Logout</span>
            </button>
        </div>
    );
};

const styles = {
    sidebar: { width: '260px', height: '100vh', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0 },
    logoSection: { padding: '30px 20px', textAlign: 'center' },
    logoText: { color: '#94a3b8', fontSize: '22px', fontWeight: 'bold' },
    roleLabel: { color: 'white', textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' },
    navLink: { display: 'flex', alignItems: 'center', padding: '15px 25px', color: '#cbd5e1', textDecoration: 'none' },
    logoutBtn: { display: 'flex', alignItems: 'center', padding: '20px 25px', backgroundColor: 'transparent', border: 'none', borderTop: '1px solid #334155', cursor: 'pointer', width: '100%', marginTop: 'auto' }
};

export default Sidebar;