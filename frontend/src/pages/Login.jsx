import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Ensure lucide-react is installed
import API from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Sending the "original" password to backend to be checked against the hash
            const { data } = await API.post('/auth/login', { email, password });
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            // Redirect based on the role returned by Spring Boot
            if (data.role === 'ADMIN') navigate('/admin-dashboard');
            else if (data.role === 'RESOLVER') navigate('/resolver-dashboard');
            else navigate('/user-dashboard');
        } catch (err) {
            console.error(err);
            alert("Login failed! Check your credentials or Database Hash.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg border border-gray-100">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to Tracker</h2>
                
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="admin@subi.com" 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type={showPassword ? "text" : "password"} // Logic to see original pass
                            required 
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="••••••••" 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        {/* Toggle Button to see password */}
                        <button 
                            type="button"
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button type="submit" className="w-full rounded-md bg-indigo-600 py-2 text-white font-semibold hover:bg-indigo-700 transition duration-200">
                        Sign in
                    </button>
                </form>

                <div className="text-center">
                    <button onClick={() => navigate('/forgot-password')} className="text-sm text-indigo-600 hover:underline">
                        Forgot your password?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;