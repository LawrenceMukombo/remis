import React, { useState } from 'react';
import {
    X, Calendar, Clock, QrCode, MapPin, CheckCircle2,
    ShieldCheck, Navigation, User, Phone, ArrowRight, AlertCircle
} from 'lucide-react';
import './ScheduleViewingModal.css';

interface ScheduleViewingModalProps {
    property: any;
    isOpen: boolean;
    onClose: () => void;
    onProceedToLease?: () => void;
}

export const ScheduleViewingModal: React.FC<ScheduleViewingModalProps> = ({
    property,
    isOpen,
    onClose,
    onProceedToLease
}) => {
    const [step, setStep] = useState<'form' | 'pass'>('form');
    const [submitting, setSubmitting] = useState(false);
    const [verifyingCheckIn, setVerifyingCheckIn] = useState(false);
    const [checkInDone, setCheckInDone] = useState(false);

    const [form, setForm] = useState({
        applicantName: '',
        applicantPhone: '',
        applicantEmail: '',
        viewingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: 'Morning (09:00 - 11:00)',
        attendees: '1 Person',
        notes: ''
    });

    const [viewingPass, setViewingPass] = useState<any>(null);

    if (!isOpen || !property) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:4000/api/marketplace/viewings/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    applicantName: form.applicantName,
                    applicantPhone: form.applicantPhone,
                    applicantEmail: form.applicantEmail,
                    viewingDate: form.viewingDate,
                    timeSlot: form.timeSlot,
                    attendees: form.attendees,
                    notes: form.notes
                })
            });
            const data = await res.json();
            if (data.success) {
                setViewingPass(data.viewingPass);
                setStep('pass');
            }
        } catch (err) {
            console.error('Error scheduling viewing:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyCheckIn = async () => {
        setVerifyingCheckIn(true);
        try {
            const res = await fetch('http://localhost:4000/api/marketplace/viewings/verify-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    viewingId: viewingPass?.viewingId,
                    qrToken: viewingPass?.qrPassToken,
                    latitude: property.latitude || -15.4167,
                    longitude: property.longitude || 28.2833,
                    verifiedBy: 'Landlord / On-Site Agent'
                })
            });
            const data = await res.json();
            if (data.success) {
                setCheckInDone(true);
            }
        } catch (err) {
            console.error('Error checking in:', err);
        } finally {
            setVerifyingCheckIn(false);
        }
    };

    return (
        <div className="viewing-modal-overlay" onClick={onClose}>
            <div className="viewing-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="viewing-modal-header">
                    <div className="viewing-header-title">
                        <Calendar size={22} color="#38bdf8" />
                        <div>
                            <h3>{step === 'form' ? 'Schedule Physical Viewing' : 'Physical Viewing Pass'}</h3>
                            <p>{property.name} • {property.address || 'Zambia'}</p>
                        </div>
                    </div>
                    <button className="close-modal-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="viewing-modal-body">
                    {step === 'form' ? (
                        <form onSubmit={handleSubmit}>
                            <div className="viewing-info-banner">
                                <ShieldCheck size={24} color="#166534" />
                                <div>
                                    <p><strong>Anti-Fraud Protected Viewing:</strong> Your contact info is protected with masked communication until on-site check-in. This guarantees verified physical attendance with GPS validation.</p>
                                </div>
                            </div>

                            <div className="viewing-form-grid">
                                <div className="viewing-field">
                                    <label>Your Full Name *</label>
                                    <input
                                        required
                                        placeholder="e.g. John Mwila"
                                        value={form.applicantName}
                                        onChange={e => setForm({ ...form, applicantName: e.target.value })}
                                    />
                                </div>

                                <div className="viewing-field">
                                    <label>Phone / WhatsApp Number *</label>
                                    <input
                                        required
                                        placeholder="+260 97 1234567"
                                        value={form.applicantPhone}
                                        onChange={e => setForm({ ...form, applicantPhone: e.target.value })}
                                    />
                                </div>

                                <div className="viewing-field">
                                    <label>Preferred Viewing Date *</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.viewingDate}
                                        onChange={e => setForm({ ...form, viewingDate: e.target.value })}
                                    />
                                </div>

                                <div className="viewing-field">
                                    <label>Time Window *</label>
                                    <select
                                        value={form.timeSlot}
                                        onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                                    >
                                        <option>Morning (09:00 - 11:00)</option>
                                        <option>Midday (11:30 - 13:30)</option>
                                        <option>Afternoon (14:00 - 16:00)</option>
                                        <option>Late Afternoon (16:30 - 18:00)</option>
                                    </select>
                                </div>

                                <div className="viewing-field">
                                    <label>Number of Visitors</label>
                                    <select
                                        value={form.attendees}
                                        onChange={e => setForm({ ...form, attendees: e.target.value })}
                                    >
                                        <option>1 Person</option>
                                        <option>2 People</option>
                                        <option>Family (3-4 People)</option>
                                    </select>
                                </div>

                                <div className="viewing-field">
                                    <label>Email Address (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={form.applicantEmail}
                                        onChange={e => setForm({ ...form, applicantEmail: e.target.value })}
                                    />
                                </div>

                                <div className="viewing-field full">
                                    <label>Special Notes for Landlord</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Any specific questions or parking requirements..."
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="viewing-modal-footer" style={{ padding: '1.5rem 0 0', background: 'transparent' }}>
                                <button type="button" className="btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Generating Pass...' : 'Confirm Viewing Appointment'}
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Viewing Pass with QR Code */
                        <div className="viewing-pass-card">
                            <div className="pass-badge">
                                <ShieldCheck size={14} /> REMIS Verified Viewing Pass
                            </div>

                            <div className="pass-id">{viewingPass?.viewingId}</div>

                            {/* Simulated High-Res QR Code */}
                            <div className="pass-qr-sim">
                                <QrCode size={110} color="#0f172a" />
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                                    SCAN ON ARRIVAL
                                </span>
                            </div>

                            <div className="pass-details-list">
                                <div className="pass-details-row">
                                    <span>Property:</span>
                                    <span>{viewingPass?.propertyName}</span>
                                </div>
                                <div className="pass-details-row">
                                    <span>Scheduled Date:</span>
                                    <span>{viewingPass?.viewingDate}</span>
                                </div>
                                <div className="pass-details-row">
                                    <span>Time Window:</span>
                                    <span>{viewingPass?.timeSlot}</span>
                                </div>
                                <div className="pass-details-row">
                                    <span>Centroid GPS:</span>
                                    <span style={{ fontFamily: 'monospace' }}>
                                        {viewingPass?.latitude ? `${viewingPass.latitude.toFixed(4)}, ${viewingPass.longitude.toFixed(4)}` : 'Lusaka Centroid'}
                                    </span>
                                </div>
                                <div className="pass-details-row">
                                    <span>Check-In Status:</span>
                                    <span style={{ color: checkInDone ? '#059669' : '#0284c7' }}>
                                        {checkInDone ? '✓ VERIFIED ON-SITE' : 'PENDING ARRIVAL'}
                                    </span>
                                </div>
                            </div>

                            {/* Verification action */}
                            <div className="checkin-verify-box">
                                {checkInDone ? (
                                    <div style={{ color: '#065f46', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                                        Physical Inspection Confirmed!
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#047857' }}>
                                            You are verified. Ready to secure this property?
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.825rem', color: '#475569' }}>
                                            When you arrive at the premises, present this QR code to the caretaker or click below to simulate GPS check-in:
                                        </p>
                                        <button
                                            type="button"
                                            className="btn-verify-checkin"
                                            onClick={handleVerifyCheckIn}
                                            disabled={verifyingCheckIn}
                                        >
                                            <Navigation size={16} />
                                            {verifyingCheckIn ? 'Validating GPS...' : 'Confirm On-Site Physical Arrival'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {checkInDone && onProceedToLease && (
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: '1rem', background: '#059669' }}
                                    onClick={() => {
                                        onClose();
                                        onProceedToLease();
                                    }}
                                >
                                    Proceed to Cap 206 Lease Agreement <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleViewingModal;
