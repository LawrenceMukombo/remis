import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import loginBg from '../assets/login-bg.png';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            // Store token & user
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Small delay for UX
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container-new">
                {/* Background Section with parallax effect attempt */}
                <div className="login-bg-side">
                    <img src={loginBg} alt="Real Estate" className="bg-image" />
                    <div className="bg-overlay"></div>
                    <div className="bg-content-text">
                        <Building2 size={48} className="logo-icon-large" />
                        <h1>REMIS Enterprise</h1>
                        <p>Advanced Real Estate Management & Infrastructure Solutions.</p>
                        <div className="trust-badges">
                            <div className="badge">
                                <ShieldCheck size={16} />
                                <span>Security Level A+</span>
                            </div>
                            <div className="badge">
                                <ShieldCheck size={16} />
                                <span>End-to-End Encryption</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="login-form-side">
                    <div className="form-inner">
                        <div className="mobile-logo">
                            <Building2 size={32} color="var(--primary-color)" />
                            <span>REMIS</span>
                        </div>

                        <div className="form-header">
                            <h2>Welcome Back</h2>
                            <p>Enter your credentials to access the administration portal.</p>
                        </div>

                        {error && (
                            <div className="premium-error">
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="premium-form">
                            <div className="premium-field">
                                <label>Business Email</label>
                                <div className="input-group">
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="premium-field">
                                <div className="label-row">
                                    <label>Access Password</label>
                                    <a href="#" className="forgot-link">Forgot?</a>
                                </div>
                                <div className="input-group">
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-footer-options">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span>Keep me signed in</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={`premium-login-btn ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="spinner"></div>
                                ) : (
                                    <>
                                        <span>Sign into Portal</span>
                                        <ArrowRight size={20} className="btn-arrow" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-footer-text">
                            <p>© 2026 REMIS Global. All rights reserved.</p>
                            <div className="footer-links">
                                <a href="#">Support</a>
                                <a href="#">Privacy</a>
                                <a href="#">Terms</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                :root {
                    --primary-color: #4f46e5;
                    --primary-hover: #4338ca;
                    --primary-glow: rgba(79, 70, 229, 0.4);
                    --text-title: #1e293b;
                    --text-body: #64748b;
                    --border-color: #e2e8f0;
                    --bg-soft: #f8fafc;
                    --error: #ef4444;
                    --success: #10b981;
                }

                @font-face {
                    font-family: 'Outfit';
                    src: url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
                }

                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f1f5f9;
                    font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
                    padding: 2rem;
                    box-sizing: border-box;
                }

                .login-container-new {
                    width: 100%;
                    max-width: 1100px;
                    height: 700px;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    display: flex;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                    position: relative;
                }

                /* Side Image Panel */
                .login-bg-side {
                    flex: 1.2;
                    position: relative;
                    overflow: hidden;
                    color: white;
                    display: flex;
                    align-items: flex-end;
                    padding: 4rem;
                }

                .bg-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 1s ease;
                }

                .login-bg-side:hover .bg-image {
                    transform: scale(1.05);
                }

                .bg-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        to bottom,
                        rgba(0,0,0,0.2) 0%,
                        rgba(0,0,0,0.8) 100%
                    );
                }

                .bg-content-text {
                    position: relative;
                    z-index: 2;
                }

                .logo-icon-large {
                    color: white;
                    margin-bottom: 1.5rem;
                    filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
                }

                .bg-content-text h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    letter-spacing: -1px;
                }

                .bg-content-text p {
                    font-size: 1.1rem;
                    opacity: 0.9;
                    max-width: 400px;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }

                .trust-badges {
                    display: flex;
                    gap: 1.5rem;
                }

                .badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(8px);
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                /* Form Panel */
                .login-form-side {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    background: white;
                }

                .form-inner {
                    width: 100%;
                    max-width: 400px;
                }

                .mobile-logo {
                    display: none;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2rem;
                }

                .mobile-logo span {
                    font-weight: 800;
                    font-size: 1.25rem;
                    letter-spacing: -0.5px;
                }

                .form-header {
                    margin-bottom: 2.5rem;
                }

                .form-header h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--text-title);
                    margin-bottom: 0.75rem;
                }

                .form-header p {
                    color: var(--text-body);
                    font-size: 0.9375rem;
                    line-height: 1.5;
                }

                .premium-error {
                    background: #fef2f2;
                    border-left: 4px solid var(--error);
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    color: #991b1b;
                    font-size: 0.875rem;
                    font-weight: 500;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .premium-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .premium-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .premium-field label {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    color: var(--text-title);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .forgot-link {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: var(--primary-color);
                    text-decoration: none;
                }

                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    color: #94a3b8;
                    transition: color 0.2s;
                }

                .input-group input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    font-size: 0.9375rem;
                    color: var(--text-title);
                    transition: all 0.2s;
                    background-color: var(--bg-soft);
                    outline: none;
                    box-sizing: border-box;
                }

                .input-group input:focus {
                    background-color: white;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 4px var(--primary-glow);
                }

                .input-group input:focus + .input-icon {
                    color: var(--primary-color);
                }

                .eye-toggle {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.25rem;
                }

                .form-footer-options {
                    display: flex;
                    align-items: center;
                    margin-top: -0.5rem;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.875rem;
                    color: var(--text-body);
                    cursor: pointer;
                }

                .remember-me input {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                }

                .premium-login-btn {
                    padding: 1rem;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%);
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px -5px var(--primary-glow);
                    margin-top: 1rem;
                }

                .premium-login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px -10px var(--primary-glow);
                    filter: brightness(1.1);
                }

                .premium-login-btn:active {
                    transform: translateY(0);
                }

                .premium-login-btn.loading {
                    opacity: 0.8;
                    cursor: not-allowed;
                }

                .btn-arrow {
                    transition: transform 0.2s;
                }

                .premium-login-btn:hover .btn-arrow {
                    transform: translateX(4px);
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .login-footer-text {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .login-footer-text p {
                    font-size: 0.75rem;
                    color: var(--text-body);
                }

                .footer-links {
                    display: flex;
                    gap: 1.5rem;
                }

                .footer-links a {
                    font-size: 0.75rem;
                    color: var(--text-body);
                    text-decoration: none;
                    transition: color 0.1s;
                }

                .footer-links a:hover {
                    color: var(--primary-color);
                }

                @media (max-width: 900px) {
                    .login-bg-side {
                        display: none;
                    }
                    .login-container-new {
                        max-width: 480px;
                        height: auto;
                    }
                    .mobile-logo {
                        display: flex;
                    }
                    .login-form-side {
                        padding: 3rem 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
