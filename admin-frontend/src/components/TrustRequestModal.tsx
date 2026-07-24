import React, { useState } from 'react';
import { X, FileSignature, Fingerprint, ArrowRight, CheckCircle, Upload, User, Shield } from 'lucide-react';
import './TrustRequestModal.css';

interface TrustRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const TrustRequestModal: React.FC<TrustRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [requestType, setRequestType] = useState<'SIGNATURE' | 'VERIFICATION' | null>(null);
    const [formData, setFormData] = useState({
        docName: '',
        signerName: '',
        signerEmail: '',
        idType: 'GOVT_ID',
        securityLevel: 'STANDARD'
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && requestType) {
            setStep(2);
        } else if (step === 2) {
            // Validate and Submit
            onSubmit({ type: requestType, ...formData });
            setStep(3); // Show success or close
            // For now, let's just close after a brief "success" state or simply close immediately via parent, 
            // but visually it's nice to show a done state. 
            // We'll reset and close for MVP simplicity after parent handles it.
            setTimeout(() => {
                onClose();
                setStep(1);
                setRequestType(null);
                setFormData({ docName: '', signerName: '', signerEmail: '', idType: 'GOVT_ID', securityLevel: 'STANDARD' });
            }, 1000);
        }
    };

    const isStep1Valid = !!requestType;
    const isStep2Valid = requestType === 'SIGNATURE'
        ? (formData.docName && formData.signerEmail)
        : (formData.signerName && formData.signerEmail);

    return (
        <div className="trust-modal-overlay">
            <div className="trust-modal-container">
                <div className="trust-modal-header">
                    <h2>New Trust Request</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="trust-modal-body">
                    {/* Stepper */}
                    <div className="workflow-stepper">
                        <div className={`step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="step-circle">{step > 1 ? <CheckCircle size={16} /> : '1'}</div>
                            <span className="step-label">Select Type</span>
                        </div>
                        <div className={`step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="step-circle">{step > 2 ? <CheckCircle size={16} /> : '2'}</div>
                            <span className="step-label">Details</span>
                        </div>
                        <div className={`step-item ${step === 3 ? 'active' : ''}`}>
                            <div className="step-circle">{step === 3 ? <CheckCircle size={16} /> : '3'}</div>
                            <span className="step-label">Confirm</span>
                        </div>
                    </div>

                    {/* Step 1: Type Selection */}
                    {step === 1 && (
                        <div className="type-selection-grid">
                            <div
                                className={`type-card ${requestType === 'SIGNATURE' ? 'selected' : ''}`}
                                onClick={() => setRequestType('SIGNATURE')}
                            >
                                <div className="type-icon"><FileSignature size={24} /></div>
                                <h3>Signature Request</h3>
                                <p>Send a document for legally binding digital signature.</p>
                            </div>
                            <div
                                className={`type-card ${requestType === 'VERIFICATION' ? 'selected' : ''}`}
                                onClick={() => setRequestType('VERIFICATION')}
                            >
                                <div className="type-icon"><Fingerprint size={24} /></div>
                                <h3>Identity Verification</h3>
                                <p>Request a user to verify their identity via ID upload.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details Form */}
                    {step === 2 && requestType === 'SIGNATURE' && (
                        <div className="form-content">
                            <div className="form-group">
                                <label>Document Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Service Agreement 2026"
                                    value={formData.docName}
                                    onChange={e => setFormData({ ...formData, docName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Signer Email</label>
                                <input
                                    type="email"
                                    placeholder="signer@example.com"
                                    value={formData.signerEmail}
                                    onChange={e => setFormData({ ...formData, signerEmail: e.target.value })}
                                />
                            </div>

                            <div className="workflow-preview">
                                <h4>Workflow Preview:</h4>
                                <ul className="workflow-steps-list">
                                    <li className="workflow-step"><Upload size={14} /> Document Uploaded</li>
                                    <li className="workflow-step"><Shield size={14} /> Security Check (Virus Scan)</li>
                                    <li className="workflow-step"><ArrowRight size={14} /> Email Sent to Signer</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 2 && requestType === 'VERIFICATION' && (
                        <div className="form-content">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.signerName}
                                    onChange={e => setFormData({ ...formData, signerName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>User Email</label>
                                <input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={formData.signerEmail}
                                    onChange={e => setFormData({ ...formData, signerEmail: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Required ID Type</label>
                                <select
                                    value={formData.idType}
                                    onChange={e => setFormData({ ...formData, idType: e.target.value })}
                                >
                                    <option value="GOVT_ID">Government ID (Passport/License)</option>
                                    <option value="COMPANY_REG">Company Registration</option>
                                    <option value="BIOMETRIC">Biometric Scan</option>
                                </select>
                            </div>

                            <div className="workflow-preview">
                                <h4>Workflow Preview:</h4>
                                <ul className="workflow-steps-list">
                                    <li className="workflow-step"><User size={14} /> Profile Created</li>
                                    <li className="workflow-step"><ArrowRight size={14} /> Verification Link Sent</li>
                                    <li className="workflow-step"><Shield size={14} /> Manual Review / AI Check</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <CheckCircle size={48} className="text-green-500" style={{ margin: '0 auto 1rem' }} />
                            <h3>Request Initiated!</h3>
                            <p>The workflow has been started successfully.</p>
                        </div>
                    )}

                </div>

                <div className="trust-modal-footer">
                    {step === 2 && <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>}
                    {step < 3 && (
                        <button
                            className="btn-primary"
                            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                            onClick={handleNext}
                        >
                            {step === 1 ? 'Next' : 'Submit Request'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrustRequestModal;
