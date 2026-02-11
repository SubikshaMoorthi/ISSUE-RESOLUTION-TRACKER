import React, { useState } from 'react';
import API from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/forgot-password', { email });
            setMessage("If an account exists, a reset link has been sent.");
        } catch (err) {
            setMessage("Error sending reset link.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 shadow rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
                <p className="text-gray-600 mb-4">Enter your email to receive a reset link.</p>
                <form onSubmit={handleSubmit}>
                    <input type="email" required className="w-full border p-2 mb-4 rounded" 
                           placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Send Link</button>
                </form>
                {message && <p className="mt-4 text-sm text-blue-600">{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;