import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <main style={{ 
                marginLeft: '260px',
                padding: '30px',
                width: 'calc(100% - 260px)',
                overflowY: 'auto',
                backgroundColor: '#f8fafc'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
