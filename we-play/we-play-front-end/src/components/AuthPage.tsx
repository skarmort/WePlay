import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    loginUsername: '',
    loginPassword: '',
    registerUsername: '',
    registerEmail: '',
    registerPassword: '',
    confirmPassword: '',
    registerName: '',
    registerPhone: '',
    birthDay: '',
    birthMonth: '',
    birthYear: ''
  });
  const [showPassword, setShowPassword] = useState({
    loginPassword: false,
    registerPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Set initial tab based on route
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Basic validation
    if (!formData.loginUsername.trim()) {
      setErrors(prev => ({ ...prev, loginUsername: 'Username is required' }));
      setLoading(false);
      return;
    }
    
    if (!formData.loginPassword) {
      setErrors(prev => ({ ...prev, loginPassword: 'Password is required' }));
      setLoading(false);
      return;
    }
    
    try {
      const result = await login(formData.loginUsername, formData.loginPassword);
      
      if (result.success) {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setErrors(prev => ({ ...prev, loginSubmit: result.error }));
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, loginSubmit: 'An unexpected error occurred' }));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.registerUsername.trim()) {
      newErrors.registerUsername = 'Username is required';
    } else if (formData.registerUsername.length < 3) {
      newErrors.registerUsername = 'Username must be at least 3 characters';
    }
    
    if (!formData.registerEmail.trim()) {
      newErrors.registerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.registerEmail)) {
      newErrors.registerEmail = 'Email is invalid';
    }
    
    if (!formData.registerPassword) {
      newErrors.registerPassword = 'Password is required';
    } else if (formData.registerPassword.length < 6) {
      newErrors.registerPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.registerPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    try {
      const result = await register(
        formData.registerUsername,
        formData.registerEmail,
        formData.registerPassword
      );
      
      if (result.success) {
        setSuccessMessage('Registration successful! Please login.');
        setFormData(prev => ({
          ...prev,
          registerUsername: '',
          registerEmail: '',
          registerPassword: '',
          confirmPassword: ''
        }));
        
        setTimeout(() => {
          setActiveTab('login');
          setFormData(prev => ({
            ...prev,
            loginUsername: formData.registerEmail,
            loginPassword: ''
          }));
        }, 2000);
      } else {
        setErrors(prev => ({ ...prev, registerSubmit: result.error }));
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, registerSubmit: 'Registration failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="auth-container w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="brand-logo text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              We Play
            </h1>
            <p className="text-gray-600 mt-1">Connect. Compete. Conquer.</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              className={`flex-1 py-3 rounded-lg transition-all duration-300 ${activeTab === 'login' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500'}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-3 rounded-lg transition-all duration-300 ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500'}`}
              onClick={() => setActiveTab('register')}
            >
              Sign Up
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Error Messages */}
          {errors.loginSubmit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.loginSubmit}
            </div>
          )}
          {errors.registerSubmit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.registerSubmit}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="animate-fadeIn">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="loginUsername"
                    value={formData.loginUsername}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${errors.loginUsername ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                  {errors.loginUsername && (
                    <p className="text-red-500 text-sm mt-1">{errors.loginUsername}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.loginPassword ? "text" : "password"}
                      name="loginPassword"
                      value={formData.loginPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${errors.loginPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, loginPassword: !prev.loginPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.loginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.loginPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.loginPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <div className="animate-fadeIn">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="registerUsername"
                    value={formData.registerUsername}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${errors.registerUsername ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                    placeholder="Choose a username"
                    disabled={loading}
                  />
                  {errors.registerUsername && (
                    <p className="text-red-500 text-sm mt-1">{errors.registerUsername}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="registerEmail"
                    value={formData.registerEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${errors.registerEmail ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {errors.registerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.registerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.registerPassword ? "text" : "password"}
                      name="registerPassword"
                      value={formData.registerPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${errors.registerPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                      placeholder="Create a password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, registerPassword: !prev.registerPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.registerPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.registerPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.registerPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.confirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;