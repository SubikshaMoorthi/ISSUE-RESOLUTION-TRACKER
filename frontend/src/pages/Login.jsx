import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Lock, Mail } from 'lucide-react';

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
        <div className="login-container" style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
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

                <button type="submit" style={styles.button}>Sign In</button>
            </form>
        </div>
    );
};

// Simple inline styles for now
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
    form: { padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' },
    inputGroup: { display: 'flex', alignItems: 'center', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', borderRadius: '5px' },
    input: { border: 'none', outline: 'none', marginLeft: '10px', width: '100%' },
    button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Login;
