import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            {sidebarOpen && <div className="app-overlay" onClick={closeSidebar} />}
            <main className="app-main" style={{ 
                marginLeft: '260px',
                padding: '30px',
                width: 'calc(100% - 260px)',
                overflowY: 'auto',
                backgroundColor: '#f8fafc'
            }}>
                <div className="app-topbar">
                    <button
                        type="button"
                        className="app-hamburger"
                        aria-label="Open sidebar"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
                {children}
            </main>
        </div>
    );
};

export default Layout;
