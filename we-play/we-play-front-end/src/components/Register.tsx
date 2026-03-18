// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './styles.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        surname: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation to ensure all fields are filled
        for (const key in formData) {
            if (formData[key as keyof typeof formData] === '') {
                alert('Please fill in all fields.');
                return;
            }
        }

        try {
            // Use backend auth API (Spring Boot) and only send expected fields
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            };

            const response = await authAPI.signup(payload);

            console.log('Registration successful:', response);
            alert('Registration successful! Redirecting to login.');
            navigate('/login'); // Redirect to login page
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-page-container">
            <h2>Register</h2>
            <div className="form-container">             
                <form onSubmit={handleRegister}>
                    {/* Input fields for registration */}
                    <div className="input-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="surname">Surname</label>
                        <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="username">username</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="dateOfBirth">Date of Birth</label>
                        <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="text" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Secure Password</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="auth-button">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;