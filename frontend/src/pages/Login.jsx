import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Lock, Mail } from 'lucide-react';
import loginIllustration from '../assets/login-issue-illustration.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await API.post('/auth/login', { email, password });
            login(res.data); // This saves token and user info to Context

            // Redirect based on Role
            if (res.data.role === 'ROLE_ADMIN') navigate('/admin/performance');
            else if (res.data.role === 'ROLE_RESOLVER') navigate('/resolver-dashboard');
            else navigate('/user-dashboard');
            
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        }
    };

    return (
        <div className="login-shell login-container" style={styles.container}>
            <div className="login-card" style={styles.card}>
                <div className="login-side" style={styles.side}>
                    <div style={styles.brandRow}>
                        <div style={styles.brandMark}>IRT</div>
                        <div>
                            <div style={styles.brandTitle}>Issue Resolution Tracker</div>
                            <div style={styles.brandSub}>Secure access portal</div>
                        </div>
                    </div>
                    <div style={styles.illustrationWrap}>
                        <img
                            src={loginIllustration}
                            alt="Issue resolution overview"
                            style={styles.illustration}
                        />
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="login-form" style={styles.form}>
                    <div style={styles.formHeader}>
                        <h2 style={{ textAlign: 'center', marginBottom: '6px' }}>Login</h2>
                        <p style={styles.formSubTitle}>Use your organization email to continue.</p>
                    </div>
                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                    
                    <div style={styles.inputGroup}>
                        <Mail size={20} />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <Lock size={20} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <label style={styles.checkboxLabel}>
                            <input type="checkbox" style={styles.checkbox} />
                            Keep me signed in
                        </label>
                        <span style={styles.linkText}>Forgot password?</span>
                    </div>

                    <button type="submit" style={styles.button}>Sign In</button>

                    <div style={styles.formFooter}>
                        New here? Contact your admin to get access.
                    </div>
                </form>
            </div>
        </div>
    );
};

// Simple inline styles for now
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '40px 20px' },
    card: { display: 'flex', width: 'min(980px, 100%)', borderRadius: '18px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)', border: '1px solid rgba(148,163,184,0.35)' },
    side: { flex: 1, padding: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    brandRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
    brandMark: { width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, letterSpacing: '0.5px' },
    brandTitle: { fontSize: '18px', fontWeight: 700, color: '#0f172a' },
    brandSub: { fontSize: '12px', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' },
    illustrationWrap: { margin: '6px 0 0', display: 'flex', justifyContent: 'flex-start' },
    illustration: { width: '100%', maxWidth: '360px', height: 'auto', borderRadius: '18px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.14)' },
    form: { flex: 1, padding: '42px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' },
    formHeader: { marginBottom: '4px' },
    formSubTitle: { textAlign: 'center', color: '#64748b', fontSize: '13px' },
    inputGroup: { display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', padding: '12px 14px', marginBottom: '6px', borderRadius: '10px', backgroundColor: '#f8fafc' },
    input: { border: 'none', outline: 'none', marginLeft: '10px', width: '100%', background: 'transparent', fontSize: '15px' },
    formRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', marginBottom: '6px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px' },
    checkbox: { width: '14px', height: '14px' },
    linkText: { color: '#2563eb', fontWeight: 600, cursor: 'pointer' },
    button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', marginTop: '6px', boxShadow: '0 12px 25px rgba(37, 99, 235, 0.25)' },
    formFooter: { marginTop: '6px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }
};

export default Login;
