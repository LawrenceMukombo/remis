import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, User, Home, Mail, Phone, ArrowRight,
    CheckCircle, ShieldCheck, ChevronLeft, Upload, Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

const ApplicationFlow: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        moveInDate: '',
        message: '',
        occupants: '1'
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        // Simulate API call to Expression of Interest
        try {
            const res = await fetch('http://localhost:4000/api/crm/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    propertyId: id,
                    type: 'RENTAL_APP'
                })
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitted(true); // Fallback for demo
        }
    };

    if (submitted) {
        return (
            <div className="success-container">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="success-card premium-card"
                >
                    <div className="success-icon">
                        <CheckCircle size={80} color="#10b981" />
                    </div>
                    <h1>Application Submitted!</h1>
                    <p>Your application for property <strong>#{id?.slice(0, 8)}</strong> has been successfully received. Our property manager will review it and contact you within 24-48 hours.</p>
                    <div className="next-steps">
                        <h4>Next Steps:</h4>
                        <ul>
                            <li>Check your email for a confirmation receipt.</li>
                            <li>Complete your identity verification (optional).</li>
                            <li>Wait for the manager to schedule a viewing.</li>
                        </ul>
                    </div>
                    <button className="btn-primary w-full" onClick={() => navigate('/')}>Return to Listings</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flow-page">
            <div className="flow-sidebar">
                <div className="sidebar-branding">
                    <Building2 size={32} color="white" />
                    <h2>REMIS Realty</h2>
                </div>

                <div className="steps-indicator">
                    <div className={`step-line ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-num">1</span>
                        <span className="step-label">Personal Information</span>
                    </div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-num">2</span>
                        <span className="step-label">Rental Details</span>
                    </div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-num">3</span>
                        <span className="step-label">Review & Submit</span>
                    </div>
                </div>

                <div className="trust-footer">
                    <ShieldCheck size={20} />
                    <span>Your data is encrypted and secure.</span>
                </div>
            </div>

            <main className="flow-content">
                <button className="back-link" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
                    <ChevronLeft size={18} /> Back
                </button>

                <form onSubmit={handleSubmit} className="application-form">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1>Let's get started</h1>
                            <p>Please enter your contact details so we can reach you about your application.</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <div className="input-with-icon">
                                        <User size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="input-with-icon">
                                        <Phone size={18} />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+675 ..."
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1>Moving Details</h1>
                            <p>When is the client likely to move in and how many people will be staying?</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Likely Move-in Date</label>
                                    <input
                                        type="date"
                                        className="plain-input"
                                        required
                                        value={formData.moveInDate}
                                        onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Total Occupants</label>
                                    <select
                                        className="plain-input"
                                        value={formData.occupants}
                                        onChange={e => setFormData({ ...formData, occupants: e.target.value })}
                                    >
                                        <option>1 Person</option>
                                        <option>2 People</option>
                                        <option>3 People</option>
                                        <option>4+ People</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Anything else we should know?</label>
                                    <textarea
                                        placeholder="Briefly describe your requirements..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1>Review Application</h1>
                            <p>Please confirm all details are correct before submitting to the property manager.</p>

                            <div className="review-box premium-card">
                                <div className="review-row">
                                    <span className="label">Property</span>
                                    <span className="value">#{id?.slice(0, 8)}</span>
                                </div>
                                <div className="review-row">
                                    <span className="label">Applicant</span>
                                    <span className="value">{formData.fullName}</span>
                                </div>
                                <div className="review-row">
                                    <span className="label">Contact</span>
                                    <span className="value">{formData.email} / {formData.phone}</span>
                                </div>
                                <div className="review-row">
                                    <span className="label">Likely Move-in Date</span>
                                    <span className="value">{formData.moveInDate}</span>
                                </div>
                            </div>

                            <div className="consent-box">
                                <input type="checkbox" required id="consent" />
                                <label htmlFor="consent">I declare that the information provided is true and I consent to a background check if required.</label>
                            </div>
                        </motion.div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {step === 3 ? 'Submit Application' : 'Continue'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </form>
            </main>

            <style>{`
        .flow-page {
          display: flex;
          min-height: 100vh;
        }

        .flow-sidebar {
          width: 380px;
          background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%);
          padding: 4rem 3rem;
          color: white;
          display: flex;
          flex-direction: column;
        }

        .sidebar-branding {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 5rem;
        }

        .sidebar-branding h2 { font-size: 1.5rem; }

        .steps-indicator {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .step-line {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          opacity: 0.4;
          transition: all 0.3s;
        }

        .step-line.active { opacity: 1; }

        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .active .step-num {
          background: white;
          color: var(--primary);
        }

        .step-label { font-weight: 500; font-size: 1.1rem; }

        .trust-footer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .flow-content {
          flex: 1;
          background: var(--bg-app);
          padding: 4rem 6rem;
          display: flex;
          flex-direction: column;
        }

        .back-link {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 3rem;
        }

        h1 { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .application-form p { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 3rem; }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .full-width { grid-column: span 2; }

        .form-group label {
          display: block;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-main);
        }

        .input-with-icon {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 1rem;
          transition: all 0.2s;
        }

        .input-with-icon:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }

        .input-with-icon input {
          border: none;
          outline: none;
          padding: 1rem;
          flex: 1;
          font-size: 1rem;
        }

        .plain-input, textarea {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: white;
          font-size: 1rem;
          outline: none;
          font-family: inherit;
        }

        textarea { min-height: 120px; }

        .form-actions {
          margin-top: 4rem;
        }

        .review-box {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .review-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--bg-app);
          padding-bottom: 0.75rem;
        }

        .review-row .label { color: var(--text-muted); font-weight: 500; }
        .review-row .value { font-weight: 700; }

        .consent-box {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          color: var(--text-muted);
        }

        .consent-box input { margin-top: 0.25rem; }

        /* Success screen styles */
        .success-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-app);
        }

        .success-card {
          max-width: 600px;
          padding: 4rem;
          text-align: center;
        }

        .success-icon { margin-bottom: 2rem; }
        .success-card h1 { font-size: 2.25rem; margin-bottom: 1.5rem; }
        .success-card p { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2.5rem; }

        .next-steps {
          text-align: left;
          background: var(--bg-app);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 3rem;
        }

        .next-steps h4 { margin-bottom: 1rem; color: var(--text-main); }
        .next-steps ul { padding-left: 1.25rem; color: var(--text-muted); }
        .next-steps li { margin-bottom: 0.5rem; }

        @media (max-width: 900px) {
          .flow-sidebar { display: none; }
          .flow-content { padding: 2rem; }
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
        }
      `}</style>
        </div>
    );
};

export default ApplicationFlow;
