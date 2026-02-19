import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ 
                marginLeft: '260px', // Matches sidebar width
                padding: '30px', 
                width: '100%', 
                minHeight: '100vh',
                backgroundColor: '#f8fafc' 
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;