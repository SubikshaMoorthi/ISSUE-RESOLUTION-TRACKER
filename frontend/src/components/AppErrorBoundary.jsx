import React from 'react';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorMessage: error?.message || 'Unexpected application error'
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App crashed:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f8fafc',
                        padding: '20px'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            maxWidth: '720px',
                            width: '100%'
                        }}
                    >
                        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Page Error</h2>
                        <p style={{ margin: 0, color: '#475569' }}>
                            {this.state.errorMessage}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
