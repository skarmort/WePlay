// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './styles.css';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        usernameOrEmail: '',
        password: '',
    });
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await authAPI.signin(credentials);

            console.log('Login successful:', response);
            alert('Login successful! Welcome.');

            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);
            const message = error.response?.data?.message || 'Login failed. Please check your username and password.';
            setError(message);
            alert(message);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="form-container">
                <h2>Log In</h2>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="usernameOrEmail">Username or Email</label>
                        <input type="text" id="usernameOrEmail" name="usernameOrEmail" value={credentials.usernameOrEmail} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={credentials.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="auth-button">Log In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;