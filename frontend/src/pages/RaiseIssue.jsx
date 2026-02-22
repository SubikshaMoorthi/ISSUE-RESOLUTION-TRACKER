import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const RaiseIssue = () => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({ title: '', description: '', category: 'IT' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isHovering, setIsHovering] = useState(false);

    const departments = ['IT', 'MAINTENANCE', 'HOSTEL', 'ACCOUNTS'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/issues/raise', form);
            setMessage('Issue submitted successfully!');
            setForm({ title: '', description: '', category: 'IT' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error submitting issue: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.formCard}>
                <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Raise Issue</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', textAlign: 'center' }}>
                    Hi {user?.name || 'User'}, submit your issue details below.
                </p>

                {message && (
                    <div style={{
                        padding: '12px 20px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7',
                        color: message.includes('Error') ? '#991b1b' : '#166534',
                        fontWeight: '500'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                        <label style={styles.label}>Title</label>
                        <input
                            type="text"
                            placeholder="Enter issue title"
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Description</label>
                        <textarea
                            placeholder="Describe the issue in detail"
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                            required
                            rows="6"
                            style={styles.textarea}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Category</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({...form, category: e.target.value})}
                            style={styles.select}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        style={{
                            ...styles.button,
                            backgroundColor: isHovering ? '#1d4ed8' : '#2563eb',
                            opacity: loading ? 0.75 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Submitting...' : 'Submit Issue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
    },
    formCard: {
        width: '100%',
        maxWidth: '620px',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        padding: '28px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#1e293b'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        resize: 'vertical'
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        backgroundColor: 'white'
    },
    button: {
        padding: '12px 20px',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '16px',
        marginTop: '6px',
        transition: 'background-color 0.2s ease'
    }
};

export default RaiseIssue;
