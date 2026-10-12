import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, User, Home, Mail, Phone, ArrowRight,
    CheckCircle, ShieldCheck, ChevronLeft, Upload, Building2,
    DollarSign, Calendar, Compass, Briefcase, LandPlot, Factory,
    Scale, X, BookOpen, Lock
} from 'lucide-react';
import { ProtectedDocumentViewer } from '../components/ProtectedDocumentViewer';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:4000/api';

const ApplicationFlow: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [property, setProperty] = useState<any>(null);
    const [loadingProperty, setLoadingProperty] = useState(true);

    // Statutory Agreement Modal & Acknowledgement
    const [showAgreementPreviewModal, setShowAgreementPreviewModal] = useState(false);
    const [statutoryConsent, setStatutoryConsent] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        // For Residential / General Lease
        moveInDate: '',
        occupants: '1 Person',
        leaseDuration: '12 Months',
        // For Land / Sale Purchase Intent
        offerPrice: '',
        financingMethod: '100% Cash Purchase (Funds Ready)',
        intendedUse: 'Residential Development / Private Residence',
        conveyanceTimeline: 'Standard (30-60 Days)',
        // For Commercial / Industrial Lease
        businessName: '',
        businessActivity: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (id) {
            fetch(`${API_BASE}/properties/${id}`)
                .then(r => r.json())
                .then(data => {
                    setProperty(data);
                    if (data?.sale_price) {
                        setFormData(prev => ({ ...prev, offerPrice: String(data.sale_price) }));
                    }
                })
                .catch(err => console.error("Error fetching property for application:", err))
                .finally(() => setLoadingProperty(false));
        }
    }, [id]);

    const isSale = property?.listing_type === 'SALE';
    const isLand = property?.type === 'LAND';
    const isCommercial = property?.type === 'COMMERCIAL';
    const isIndustrial = property?.type === 'INDUSTRIAL';
    const isResidential = property?.type === 'RESIDENTIAL' || (!isLand && !isCommercial && !isIndustrial);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        try {
            await fetch(`${API_BASE}/crm/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    propertyName: property?.name,
                    propertyId: id,
                    type: isSale ? 'PURCHASE_INTENT' : 'RENTAL_APP',
                    details: JSON.stringify({
                        isSale,
                        propertyType: property?.type,
                        offerPrice: formData.offerPrice,
                        financingMethod: formData.financingMethod,
                        intendedUse: formData.intendedUse,
                        conveyanceTimeline: formData.conveyanceTimeline,
                        moveInDate: formData.moveInDate,
                        occupants: formData.occupants,
                        leaseDuration: formData.leaseDuration,
                        businessName: formData.businessName,
                        businessActivity: formData.businessActivity,
                        notes: formData.message,
                        statutoryTenancyConsent: !isSale && isResidential ? statutoryConsent : true
                    })
                })
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitted(true);
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
                    <h1>{isSale ? 'Purchase Intent Submitted!' : 'Application Submitted!'}</h1>
                    <p>
                        Your formal {isSale ? 'intent to purchase' : 'application for'} <strong>{property?.name || `#${id?.slice(0, 8)}`}</strong> has been successfully received. 
                        {isSale 
                            ? ' The property owner will review your offer terms and reach out to discuss title deed inspection and conveyance.' 
                            : ' Our property manager will review your submission and contact you within 24-48 hours.'}
                    </p>
                    <div className="next-steps">
                        <h4>Next Steps:</h4>
                        <ul>
                            <li>Check your email for an application receipt summary.</li>
                            <li>The verified property lister will contact you directly via phone or WhatsApp.</li>
                            <li>{isSale ? 'Prepare your conveyancing attorney or proof of funds documentation.' : 'Schedule an on-site property walkthrough inspection.'}</li>
                        </ul>
                    </div>
                    <button className="btn-primary w-full" onClick={() => navigate('/')}>Return to Marketplace</button>
                </motion.div>
            </div>
        );
    }

    const getStep2Title = () => {
        if (isSale) return 'Purchase Intent Details';
        if (isLand) return 'Ground Lease Terms';
        if (isCommercial || isIndustrial) return 'Commercial Tenancy Terms';
        return 'Residency & Moving Details';
    };

    return (
        <div className="flow-page">
            <div className="flow-sidebar">
                <div className="sidebar-branding">
                    <Building2 size={32} color="white" />
                    <div>
                        <h2>REMIS Realty</h2>
                        <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Direct Property Portal</span>
                    </div>
                </div>

                <div className="steps-indicator">
                    <div className={`step-line ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-num">1</span>
                        <span className="step-label">Personal Information</span>
                    </div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-num">2</span>
                        <span className="step-label">{getStep2Title()}</span>
                    </div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-num">3</span>
                        <span className="step-label">Review & Submit</span>
                    </div>
                </div>

                {property && (
                    <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Target Property</div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', margin: '4px 0' }}>{property.name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                            {property.type} • {isSale ? 'For Sale' : 'For Lease'} • K{property.sale_price?.toLocaleString()}
                        </div>
                    </div>
                )}

                <div className="trust-footer" style={{ marginTop: '1.5rem' }}>
                    <ShieldCheck size={20} />
                    <span>Verified Registry Security Protection.</span>
                </div>
            </div>

            <main className="flow-content">
                <button className="back-link" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
                    <ChevronLeft size={18} /> Back
                </button>

                <form onSubmit={handleSubmit} className="application-form">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1>{isSale ? 'Buyer Contact Details' : 'Applicant Contact Details'}</h1>
                            <p>Please enter your legal contact information so the verified owner or manager can connect with you.</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Legal Name *</label>
                                    <div className="input-with-icon">
                                        <User size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Lawrence Mukombo"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Official Email Address *</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="e.g. lawrence@domain.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone / WhatsApp Number *</label>
                                    <div className="input-with-icon">
                                        <Phone size={18} />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="e.g. +260963328807"
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
                            {isSale ? (
                                <>
                                    <h1>Purchase Intent & Acquisition Terms</h1>
                                    <p>Submit your formal offer and financing profile for this {property?.type || 'property'} acquisition.</p>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Proposed Purchase Offer (ZMW / K) *</label>
                                            <input
                                                type="number"
                                                className="plain-input"
                                                required
                                                placeholder={`e.g. ${property?.sale_price || 2000000}`}
                                                value={formData.offerPrice}
                                                onChange={e => setFormData({ ...formData, offerPrice: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Financing / Capital Source *</label>
                                            <select
                                                className="plain-input"
                                                value={formData.financingMethod}
                                                onChange={e => setFormData({ ...formData, financingMethod: e.target.value })}
                                            >
                                                <option value="100% Cash Purchase (Funds Ready)">100% Cash Purchase (Funds Ready)</option>
                                                <option value="Commercial Bank Mortgage / Pre-Approved">Commercial Bank Mortgage / Pre-Approved</option>
                                                <option value="Mortgage in Application">Mortgage in Application</option>
                                                <option value="Corporate / Company Treasury Funds">Corporate / Company Treasury Funds</option>
                                                <option value="Structured Payment Installments">Structured Payment Installments</option>
                                            </select>
                                        </div>

                                        {isLand && (
                                            <div className="form-group">
                                                <label>Intended Land Use / Project *</label>
                                                <select
                                                    className="plain-input"
                                                    value={formData.intendedUse}
                                                    onChange={e => setFormData({ ...formData, intendedUse: e.target.value })}
                                                >
                                                    <option value="Residential Development / Private Residence">Residential Development / Private Residence</option>
                                                    <option value="Commercial / Mixed-Use Development">Commercial / Mixed-Use Development</option>
                                                    <option value="Agricultural / Commercial Farming">Agricultural / Commercial Farming</option>
                                                    <option value="Industrial Depot / Warehousing">Industrial Depot / Warehousing</option>
                                                    <option value="Land Banking / Speculative Holding">Land Banking / Speculative Holding</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label>Target Conveyancing / Completion Timeline *</label>
                                            <select
                                                className="plain-input"
                                                value={formData.conveyanceTimeline}
                                                onChange={e => setFormData({ ...formData, conveyanceTimeline: e.target.value })}
                                            >
                                                <option value="Immediate (Within 14-30 Days)">Immediate (Within 14-30 Days)</option>
                                                <option value="Standard (30-60 Days)">Standard (30-60 Days)</option>
                                                <option value="Extended (60-90 Days)">Extended (60-90 Days)</option>
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Special Offer Conditions or Conveyancer Details</label>
                                            <textarea
                                                placeholder="Provide any additional conditions, legal representative details, or inspection timing requests..."
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (isCommercial || isIndustrial) ? (
                                <>
                                    <h1>Commercial Lease Proposal</h1>
                                    <p>Specify your organization's tenancy profile and desired lease period.</p>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Company / Trading Name *</label>
                                            <input
                                                type="text"
                                                className="plain-input"
                                                required
                                                placeholder="e.g. Copperbelt Logistics Ltd"
                                                value={formData.businessName}
                                                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Nature of Business Operations *</label>
                                            <input
                                                type="text"
                                                className="plain-input"
                                                required
                                                placeholder="e.g. FMCG Distribution & Corporate Office"
                                                value={formData.businessActivity}
                                                onChange={e => setFormData({ ...formData, businessActivity: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Proposed Lease Commencement Date *</label>
                                            <input
                                                type="date"
                                                className="plain-input"
                                                required
                                                value={formData.moveInDate}
                                                onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Preferred Lease Duration *</label>
                                            <select
                                                className="plain-input"
                                                value={formData.leaseDuration}
                                                onChange={e => setFormData({ ...formData, leaseDuration: e.target.value })}
                                            >
                                                <option value="1 Year Minimum">1 Year Minimum</option>
                                                <option value="2 Years Standard">2 Years Standard</option>
                                                <option value="3 Years Medium-Term">3 Years Medium-Term</option>
                                                <option value="5 Years Long-Term Anchor">5 Years Long-Term Anchor</option>
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Space Fitout & Operational Requirements</label>
                                            <textarea
                                                placeholder="Describe your fitout requirements, power/internet needs, or parking allocation requests..."
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1>Residency & Moving Details</h1>
                                    <p>When are you planning to occupy the premises and how many residents will be staying?</p>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Likely Move-in Date *</label>
                                            <input
                                                type="date"
                                                className="plain-input"
                                                required
                                                value={formData.moveInDate}
                                                onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Total Occupants *</label>
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
                                            <label>Special Requests or Additional Notes</label>
                                            <textarea
                                                placeholder="Briefly describe your requirements, pet arrangements, or move-in timing..."
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1>Review & Confirm Submission</h1>
                            <p>Verify your details before submitting your formal interest to the verified lister.</p>

                            <div className="review-box premium-card">
                                <div className="review-row">
                                    <span className="label">Property</span>
                                    <span className="value">{property?.name || `#${id?.slice(0, 8)}`}</span>
                                </div>
                                <div className="review-row">
                                    <span className="label">Listing Profile</span>
                                    <span className="value">{property?.type} • {isSale ? 'For Sale' : 'For Lease'}</span>
                                </div>
                                <div className="review-row">
                                    <span className="label">Applicant / Buyer</span>
                                    <span className="value">{formData.fullName}</span>
                                </div>
                                <div className="review-row">
                                    <span className="label">Contact</span>
                                    <span className="value">{formData.email} • {formData.phone}</span>
                                </div>
                                {isSale ? (
                                    <>
                                        <div className="review-row">
                                            <span className="label">Offered Purchase Price</span>
                                            <span className="value">K{Number(formData.offerPrice || property?.sale_price || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="review-row">
                                            <span className="label">Capital / Funding Source</span>
                                            <span className="value">{formData.financingMethod}</span>
                                        </div>
                                        {isLand && (
                                            <div className="review-row">
                                                <span className="label">Intended Land Project</span>
                                                <span className="value">{formData.intendedUse}</span>
                                            </div>
                                        )}
                                        <div className="review-row">
                                            <span className="label">Completion Timeline</span>
                                            <span className="value">{formData.conveyanceTimeline}</span>
                                        </div>
                                    </>
                                ) : (isCommercial || isIndustrial) ? (
                                    <>
                                        <div className="review-row">
                                            <span className="label">Business Trading Entity</span>
                                            <span className="value">{formData.businessName}</span>
                                        </div>
                                        <div className="review-row">
                                            <span className="label">Commencement Date</span>
                                            <span className="value">{formData.moveInDate}</span>
                                        </div>
                                        <div className="review-row">
                                            <span className="label">Tenancy Duration</span>
                                            <span className="value">{formData.leaseDuration}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="review-row">
                                        <span className="label">Planned Move-in Date</span>
                                        <span className="value">{formData.moveInDate} ({formData.occupants})</span>
                                    </div>
                                )}
                            </div>

                            {/* Option 2: Pre-submission Tenancy Agreement Preview for Residential Leases */}
                            {!isSale && isResidential && (
                                <div className="statutory-preview-card">
                                    <div className="statutory-card-header">
                                        <div className="statutory-title-wrap">
                                            <ShieldCheck size={22} color="#0284c7" />
                                            <div>
                                                <h3>Statutory Residential Tenancy Framework</h3>
                                                <p>Republic of Zambia • Rent Act (Chapter 206 of the Laws of Zambia)</p>
                                            </div>
                                        </div>
                                        <span className="statutory-badge">Legal Standard</span>
                                    </div>

                                    <p className="statutory-desc">
                                        All approved residential tenancies in REMIS execute under the statutory Zambian tenancy covenants. Key rights and protections governing your lease include:
                                    </p>

                                    <div className="statutory-covenants-grid">
                                        <div className="covenant-item">
                                            <span className="cov-icon">⚖️</span>
                                            <div>
                                                <strong>1 Month Notice</strong>
                                                <p>Standard 1 calendar month written termination notice for periodic tenancies.</p>
                                            </div>
                                        </div>
                                        <div className="covenant-item">
                                            <span className="cov-icon">🛡️</span>
                                            <div>
                                                <strong>14-Day Refund</strong>
                                                <p>Refundable security deposit returned within 14 business days post-handover.</p>
                                            </div>
                                        </div>
                                        <div className="covenant-item">
                                            <span className="cov-icon">🔨</span>
                                            <div>
                                                <strong>Structural Maintenance</strong>
                                                <p>Landlord responsibility for roof, outer walls, mains drainage, and power.</p>
                                            </div>
                                        </div>
                                        <div className="covenant-item">
                                            <span className="cov-icon">🚫</span>
                                            <div>
                                                <strong>No Self-Help Evictions</strong>
                                                <p>Strict bar against lockouts, seizure of personal effects, or utility cuts.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="statutory-card-actions">
                                        <button
                                            type="button"
                                            className="btn-preview-clauses"
                                            onClick={() => setShowAgreementPreviewModal(true)}
                                        >
                                            <FileText size={15} /> Read Full Agreement Clauses (Cap 206)
                                        </button>
                                        <span className="statutory-hint">Opens official standard 16-clause agreement preview</span>
                                    </div>
                                </div>
                            )}

                            <div className="consent-box">
                                <input type="checkbox" required id="consent" />
                                <label htmlFor="consent">
                                    I certify that the information provided is accurate and represents a genuine declaration of intent to {isSale ? 'purchase' : 'lease'} this property.
                                </label>
                            </div>

                            {!isSale && isResidential && (
                                <div className="consent-box statutory-consent-box">
                                    <input
                                        type="checkbox"
                                        required
                                        id="statutory-consent"
                                        checked={statutoryConsent}
                                        onChange={e => setStatutoryConsent(e.target.checked)}
                                    />
                                    <label htmlFor="statutory-consent">
                                        <strong>I acknowledge and accept the statutory tenancy terms under the Republic of Zambia Rent Act (Cap 206)</strong> that will govern this lease upon application approval.
                                    </label>
                                </div>
                            )}
                        </motion.div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {step === 3 ? (isSale ? 'Submit Purchase Intent' : 'Submit Lease Application') : 'Continue'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </form>
            </main>

            {/* Statutory Tenancy Agreement Preview Modal */}
            {showAgreementPreviewModal && (
                <div className="tenancy-preview-overlay" onClick={() => setShowAgreementPreviewModal(false)}>
                    <div className="tenancy-preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="tenancy-preview-header">
                            <div>
                                <h2>Republic of Zambia • Standard Residential Tenancy Agreement</h2>
                                <p>Rent Act (Chapter 206 of the Laws of Zambia) • Statutory Preview</p>
                            </div>
                            <button
                                type="button"
                                className="close-preview-btn"
                                onClick={() => setShowAgreementPreviewModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="tenancy-preview-body" style={{ padding: 0 }}>
                            <ProtectedDocumentViewer
                                title="Republic of Zambia • Standard Residential Tenancy Agreement (Cap 206)"
                                documentType="STATUTORY_PREVIEW"
                                userIdentifier={formData.fullName || formData.phone || 'PROSPECTIVE_TENANT'}
                            >
                                <div className="tenancy-preview-paper">
                                    <div className="preview-statutory-top">
                                        <div className="doc-coat-of-arms">REPUBLIC OF ZAMBIA</div>
                                        <h3>RESIDENTIAL TENANCY AGREEMENT</h3>
                                        <div className="doc-sub">For a Studio Unit, Two-Bedroom Duplex or Other Residential Unit</div>
                                        <div className="doc-statutory-cite">Statutory Covenants under the Rent Act, Chapter 206 of the Laws of Zambia</div>
                                    </div>

                                    <div className="clause-item">
                                        <h4>1. Rented Premises & Permitted Use</h4>
                                        <p>The Premises shall be occupied strictly and exclusively as a private dwelling residence by the approved Tenant and authorized occupants. Unlawful activities, unauthorized sub-letting, and commercial trade without written license are strictly prohibited.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>2. Tenancy Period & Extension</h4>
                                        <p>Periodic monthly tenancies continue month-to-month until terminated by lawful notice. Fixed-term tenancies terminate on their agreed expiry date unless extended or renewed in writing by both Parties.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>3. Rent Payment & Official Proof</h4>
                                        <p>Agreed monthly rent is payable in advance on or before the due date specified in the final contract. The Tenant shall retain proof of payment, and shall not withhold or deduct rent without the Landlord’s written consent or lawful court order.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>4. Security Deposit & 14-Day Refund Guarantee</h4>
                                        <p>A refundable security deposit shall be held against unpaid rent, utility liabilities, or tenant-caused damages. Fair wear and tear shall not be deducted. The unencumbered balance shall be refunded within fourteen (14) business days after vacant possession is handed over.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>5. Utilities and Municipal Charges</h4>
                                        <p>Electricity (ZESCO) token meter units shall be metered directly to the Tenant. Landlord structural water supply and common perimeter security charges are maintained as specified in the agreed schedule.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>6. Landlord’s Statutory Responsibilities</h4>
                                        <p>The Landlord covenants to afford the Tenant quiet enjoyment of the Premises and to maintain the main roof, exterior walls, structural framework, main electrical installation, and primary plumbing/drainage systems in good order.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>7. Tenant’s Statutory Responsibilities</h4>
                                        <p>The Tenant shall maintain the interior in good, sanitary condition, promptly report defects, avoid disturbance or nuisance to neighbors, and deliver up all keys upon lease termination.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>8. Alterations & Subletting</h4>
                                        <p>The Tenant shall not alter wiring, drill structural surfaces, change perimeter locks, or sublet the premises without prior written consent.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>9. Landlord Inspection & Access</h4>
                                        <p>Except in emergency circumstances, the Landlord shall provide at least twenty-four (24) hours' prior written notice before entering for necessary inspections or maintenance.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>10. Termination & Statutory Protection against Unlawful Eviction</h4>
                                        <p>Either Party may terminate a periodic monthly tenancy by serving at least one (1) calendar month’s written notice. Recovery of possession shall follow the statutory process under the Rent Act (Cap 206). <strong>The Landlord is prohibited from unlawful self-help evictions, changing locks, seizing belongings, or disconnecting essential water or power services.</strong></p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>11. Vacating & Handover Inspection</h4>
                                        <p>The Parties shall conduct a joint move-out condition inspection and verify that all utility balances are reconciled before deposit refund.</p>
                                    </div>

                                    <div className="clause-item">
                                        <h4>12. Governing Law & Dispute Resolution</h4>
                                        <p>This agreement is governed by the laws of the Republic of Zambia, with jurisdiction vested in the Subordinate Courts and High Court of Zambia under the Rent Act (Cap 206).</p>
                                    </div>
                                </div>
                            </ProtectedDocumentViewer>
                        </div>

                        <div className="tenancy-preview-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowAgreementPreviewModal(false)}
                            >
                                Close Preview
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ margin: 0 }}
                                onClick={() => {
                                    setStatutoryConsent(true);
                                    setShowAgreementPreviewModal(false);
                                }}
                            >
                                <CheckCircle size={16} /> I Understand & Accept Statutory Covenants
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

        /* Statutory Tenancy Preview Card (Option 2) */
        .statutory-preview-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          padding: 1.75rem;
          margin-bottom: 2rem;
        }

        .statutory-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .statutory-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .statutory-title-wrap h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .statutory-title-wrap p {
          margin: 0.15rem 0 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .statutory-badge {
          background: #e0f2fe;
          color: #0369a1;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .statutory-desc {
          margin: 0 0 1.25rem;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
        }

        .statutory-covenants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .covenant-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .cov-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        .covenant-item strong {
          display: block;
          font-size: 0.875rem;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .covenant-item p {
          margin: 0;
          font-size: 0.775rem;
          color: #64748b;
          line-height: 1.4;
        }

        .statutory-card-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-preview-clauses {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s;
        }

        .btn-preview-clauses:hover {
          background: #0369a1;
        }

        .statutory-hint {
          font-size: 0.8rem;
          color: #64748b;
        }

        .statutory-consent-box {
          margin-top: 1rem;
          padding: 1rem 1.25rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          color: #166534;
        }

        .statutory-consent-box label {
          font-size: 0.875rem;
          color: #166534;
          cursor: pointer;
        }

        /* Tenancy Preview Modal Overlay */
        .tenancy-preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 1.5rem;
        }

        .tenancy-preview-modal {
          background: #ffffff;
          border-radius: 16px;
          width: 850px;
          max-width: 95vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .tenancy-preview-header {
          padding: 1.25rem 2rem;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1e293b;
        }

        .tenancy-preview-header h2 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .tenancy-preview-header p {
          margin: 0.25rem 0 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .close-preview-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
        }

        .close-preview-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        .tenancy-preview-body {
          padding: 2rem;
          overflow-y: auto;
          background: #f1f5f9;
          flex: 1;
        }

        .tenancy-preview-paper {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 2.5rem 2.5rem;
          font-family: 'Times New Roman', Times, serif, system-ui;
          line-height: 1.6;
          color: #1e293b;
          max-width: 750px;
          margin: 0 auto;
        }

        .preview-statutory-top {
          text-align: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 1.25rem;
          margin-bottom: 2rem;
        }

        .doc-coat-of-arms {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #475569;
          margin-bottom: 0.35rem;
        }

        .preview-statutory-top h3 {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin: 0.4rem 0;
          color: #0f172a;
        }

        .doc-sub {
          font-size: 0.95rem;
          font-style: italic;
          color: #334155;
          margin-bottom: 0.4rem;
        }

        .doc-statutory-cite {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0284c7;
          text-transform: uppercase;
        }

        .clause-item {
          margin-bottom: 1.5rem;
        }

        .clause-item h4 {
          margin: 0 0 0.4rem 0;
          font-size: 0.975rem;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          border-bottom: 1px dotted #cbd5e1;
          padding-bottom: 0.2rem;
        }

        .clause-item p {
          margin: 0;
          font-size: 0.9rem;
          color: #334155;
          text-align: justify;
        }

        .tenancy-preview-footer {
          padding: 1rem 2rem;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
        }


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
