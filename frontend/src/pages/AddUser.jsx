import { useState } from 'react';
import API from '../api/axios';
import { UserPlus, Mail, Lock, Building, UserCircle, Check } from 'lucide-react';

const AddUser = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ROLE_USER',
        department: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const DEPARTMENTS = ['IT', 'MAINTENANCE', 'HOSTEL', 'ACCOUNTS', 'LIBRARY', 'SPORTS'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        try {
            const res = await API.post('/auth/register', formData);
            setMessage({ type: 'success', text: res.data.message });
            setFormData({ name: '', email: '', password: '', role: 'ROLE_USER', department: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.centerWrapper}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.headerIcon}>
                            <UserPlus size={32} color="#fff" />
                        </div>
                        <h1 style={styles.title}>Create New User</h1>
                        <p style={styles.subtitle}>Add a new user to the system</p>
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '14px 16px',
                            marginBottom: '24px',
                            borderRadius: '10px',
                            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: message.type === 'success' ? '#166534' : '#991b1b',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`
                        }}>
                            <Check size={18} />
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name *</label>
                            <div style={styles.inputWrapper}>
                                <UserCircle size={20} color="#94a3b8" />
                                <input
                                    style={styles.input}
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address *</label>
                            <div style={styles.inputWrapper}>
                                <Mail size={20} color="#94a3b8" />
                                <input
                                    style={styles.input}
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password *</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={20} color="#94a3b8" />
                                <input
                                    style={styles.input}
                                    type="password"
                                    placeholder="Secure password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Role *</label>
                            <div style={styles.inputWrapper}>
                                <UserPlus size={20} color="#94a3b8" />
                                <select
                                    style={styles.input}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value, department: '' })}
                                >
                                    <option value="ROLE_USER">User</option>
                                    <option value="ROLE_RESOLVER">Resolver</option>
                                    <option value="ROLE_ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        {formData.role === 'ROLE_RESOLVER' && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Department *</label>
                                <div style={styles.inputWrapper}>
                                    <Building size={20} color="#94a3b8" />
                                    <select
                                        style={styles.input}
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Department...</option>
                                        {DEPARTMENTS.map((dept) => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                ...styles.submitBtn,
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? 'Creating User...' : 'Create User'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        minHeight: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        paddingTop: '30px',
        paddingBottom: '30px'
    },
    centerWrapper: {
        width: '100%',
        maxWidth: '480px'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '28px 24px',
        border: '1px solid #e2e8f0'
    },
    header: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    headerIcon: {
        width: '50px',
        height: '50px',
        backgroundColor: '#2563eb',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px auto'
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 6px 0'
    },
    subtitle: {
        fontSize: '13px',
        color: '#64748b',
        margin: '0'
    },
    formGroup: {
        marginBottom: '16px'
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '6px'
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: '13px',
        color: '#1e293b',
        fontFamily: 'inherit'
    },
    submitBtn: {
        width: '100%',
        padding: '10px 20px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '18px',
        transition: 'background-color 0.3s ease',
    }
};

export default AddUser;
