import React, { useState, useEffect } from 'react';
import {
    X, Printer, CheckCircle, FileText, Edit3, Shield,
    Download, AlertCircle, Building, User, Calendar, DollarSign, Lock
} from 'lucide-react';
import ProtectedDocumentViewer from './ProtectedDocumentViewer';
import './LeaseAgreementModal.css';

interface LeaseAgreementModalProps {
    lease: any;
    isOpen: boolean;
    onClose: () => void;
    onSignatureUpdated?: () => void;
}

export const LeaseAgreementModal: React.FC<LeaseAgreementModalProps> = ({
    lease,
    isOpen,
    onClose,
    onSignatureUpdated
}) => {
    const [activeTab, setActiveTab] = useState<'document' | 'edit'>('document');
    const [signingLoading, setSigningLoading] = useState(false);
    const [signatures, setSignatures] = useState<any[]>([]);

    // Customizable Agreement State
    const [agreementData, setAgreementData] = useState({
        // Execution Date
        day: new Date().getDate().toString(),
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear().toString(),

        // Landlord
        landlordName: 'REMIS Property Holdings Ltd / Property Owner',
        landlordNrc: '102948/11/1 (PACRA 120240091)',
        landlordAddress: 'Plot 4920, Great East Road, Lusaka, Zambia',
        landlordPhone: '+260 97 1234567',

        // Tenant
        tenantName: '',
        tenantNrc: '',
        tenantAddress: '',
        tenantPhone: '',

        // Premises
        propertyAddress: '',
        unitName: 'Unit 1',
        unitType: 'Two-bedroom duplex',
        occupants: 'Primary Tenant and direct family dependants',

        // Term
        commencementDate: '',
        endDate: '',
        termType: 'Twelve months',

        // Rent & Security
        rentAmount: '0',
        dueDay: '5th',
        paymentMethod: 'Bank transfer / Mobile Money (ZMW)',
        paymentDetails: 'Standard Chartered Bank Zambia / Airtel Money Merchant: 88201',
        depositAmount: '0',

        // Utilities Matrix
        electricityParty: 'Tenant', // Tenant pays via ZESCO prepaid
        waterParty: 'Landlord',     // Borehole water included
        refuseParty: 'Landlord',    // Commercial refuse bin included
        securityParty: 'Landlord',  // Guard and electric fence included

        // Pets & Condition
        petsPermitted: 'Permitted only with prior written consent',
        recordedDefects: 'Premises inspected in clean, tenantable decorative condition. All keys, electrical fixtures, and plumbing tested operational.',

        // Witness
        witnessName: 'Mukombo B. (Leasing Manager)',
        witnessNrc: '294810/61/1',
        witnessDate: new Date().toLocaleDateString('en-GB')
    });

    useEffect(() => {
        if (lease) {
            const startDate = lease.startDate ? new Date(lease.startDate).toLocaleDateString('en-GB') : '';
            const endDate = lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-GB') : '';
            const rentVal = lease.rentAmount ? Number(lease.rentAmount).toLocaleString() : '0';

            setAgreementData(prev => ({
                ...prev,
                tenantName: lease.renter?.name || '',
                tenantNrc: lease.renter?.idNumber || 'NRC Pending Verification',
                tenantPhone: lease.renter?.phone || lease.renter?.email || '',
                tenantAddress: lease.renter?.address || lease.property?.address || 'Lusaka, Zambia',
                propertyAddress: lease.property?.address || lease.property?.name || 'Property Premises, Lusaka',
                unitName: lease.property?.name || 'Unit 1',
                commencementDate: startDate,
                endDate: endDate,
                rentAmount: rentVal,
                depositAmount: rentVal, // Standard 1 month deposit
            }));

            // Fetch any existing signatures
            if (lease.signatures && Array.isArray(lease.signatures)) {
                setSignatures(lease.signatures);
            } else if (lease.id) {
                fetch(`http://localhost:4000/api/leases/${lease.id}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data?.signatures) setSignatures(data.signatures);
                    })
                    .catch(() => {});
            }
        }
    }, [lease]);

    if (!isOpen || !lease) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleSignAsManager = async () => {
        setSigningLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/leases/${lease.id}/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signatureType: 'MANAGER',
                    signatureData: `REMIS Cryptographic Stamp: [ZAM-REMIS-AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}] Authorized by ${agreementData.landlordName}`
                })
            });
            const data = await res.json();
            if (data.success && data.signatures) {
                setSignatures(data.signatures);
                if (onSignatureUpdated) onSignatureUpdated();
            }
        } catch (err) {
            console.error("Signing failed:", err);
        } finally {
            setSigningLoading(false);
        }
    };

    const handleSignAsTenant = async () => {
        setSigningLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/leases/${lease.id}/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signatureType: 'RENTER',
                    signatureData: `Digital Tenant Acceptance: [ZAM-TENANT-ACK-${Math.random().toString(36).substring(2, 9).toUpperCase()}] Signed by ${agreementData.tenantName} (NRC: ${agreementData.tenantNrc})`
                })
            });
            const data = await res.json();
            if (data.success && data.signatures) {
                setSignatures(data.signatures);
                if (onSignatureUpdated) onSignatureUpdated();
            }
        } catch (err) {
            console.error("Tenant signing failed:", err);
        } finally {
            setSigningLoading(false);
        }
    };

    const landlordSig = signatures.find(s => s.signatureType === 'MANAGER');
    const tenantSig = signatures.find(s => s.signatureType === 'RENTER');

    return (
        <div className="lease-agreement-overlay" onClick={onClose}>
            <div className="lease-agreement-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="lease-agreement-header">
                    <div className="lease-agreement-title-group">
                        <FileText size={22} color="#38bdf8" />
                        <div>
                            <h2>Residential Tenancy Agreement</h2>
                            <p>Republic of Zambia • Rent Act (Chapter 206 of the Laws of Zambia)</p>
                        </div>
                        <span className="lease-agreement-badge">Official Template</span>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="lease-agreement-toolbar">
                    <div className="lease-tabs">
                        <button
                            className={`lease-tab-btn ${activeTab === 'document' ? 'active' : ''}`}
                            onClick={() => setActiveTab('document')}
                        >
                            <FileText size={16} /> Legal Document (Print Ready)
                        </button>
                        <button
                            className={`lease-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                            onClick={() => setActiveTab('edit')}
                        >
                            <Edit3 size={16} /> Edit Details & Covenants
                        </button>
                    </div>

                    <div className="lease-toolbar-actions">
                        <button
                            type="button"
                            className="btn-agreement-download"
                            onClick={() => window.print()}
                            title="Download / Print Official Contract"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#065f46', border: '1px solid #10b981', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                            <Download size={15} /> Download Contract (PDF)
                        </button>
                        {!landlordSig && (
                            <button
                                className="btn-agreement-sign"
                                onClick={handleSignAsManager}
                                disabled={signingLoading}
                            >
                                <Shield size={16} /> {signingLoading ? 'Signing...' : 'Sign as Landlord/Agent'}
                            </button>
                        )}
                        {!tenantSig && (
                            <button
                                className="btn-agreement-sign"
                                style={{ background: '#0284c7' }}
                                onClick={handleSignAsTenant}
                                disabled={signingLoading}
                            >
                                <CheckCircle size={16} /> Record Tenant Signature
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div className="lease-agreement-body">
                    {activeTab === 'document' ? (
                        <ProtectedDocumentViewer 
                            title="Republic of Zambia • Standard Residential Tenancy Agreement (Cap 206)"
                            documentType="RESIDENTIAL_TENANCY_AGREEMENT"
                            userIdentifier={agreementData.landlordName || 'LEGAL_AUDITOR'}
                            allowDownload={true}
                            onDownloadContract={() => window.print()}
                        >
                            <div className="document-paper">
                                {/* Statutory Header */}
                            <div className="doc-statutory-header">
                                <div className="doc-coat-of-arms">REPUBLIC OF ZAMBIA</div>
                                <h1>RESIDENTIAL TENANCY AGREEMENT</h1>
                                <div className="doc-subtitle">For a Studio Unit, Two-Bedroom Duplex or Other Residential Unit</div>
                                <div className="doc-act-cite">Governed under the Rent Act, Chapter 206 of the Laws of Zambia</div>
                            </div>

                            {/* Execution Intro */}
                            <div className="doc-intro">
                                This Agreement is made on the <strong>{agreementData.day}</strong> day of <strong>{agreementData.month}</strong> 20<strong>{agreementData.year}</strong> between the following parties:
                            </div>

                            {/* Parties Grid */}
                            <div className="doc-parties-grid">
                                <div className="doc-party-card">
                                    <h3>LANDLORD</h3>
                                    <div className="doc-party-field"><strong>Full Name:</strong> {agreementData.landlordName}</div>
                                    <div className="doc-party-field"><strong>NRC / Reg No:</strong> {agreementData.landlordNrc}</div>
                                    <div className="doc-party-field"><strong>Address:</strong> {agreementData.landlordAddress}</div>
                                    <div className="doc-party-field"><strong>Telephone:</strong> {agreementData.landlordPhone}</div>
                                </div>
                                <div className="doc-party-card">
                                    <h3>TENANT</h3>
                                    <div className="doc-party-field"><strong>Full Name:</strong> {agreementData.tenantName}</div>
                                    <div className="doc-party-field"><strong>NRC / Passport No:</strong> {agreementData.tenantNrc}</div>
                                    <div className="doc-party-field"><strong>Permanent Address:</strong> {agreementData.tenantAddress}</div>
                                    <div className="doc-party-field"><strong>Telephone:</strong> {agreementData.tenantPhone}</div>
                                </div>
                            </div>

                            {/* Clauses */}
                            <div className="doc-clause">
                                <div className="doc-clause-title">1. Rented Premises</div>
                                <div className="doc-clause-body">
                                    <p><strong>Property Address:</strong> {agreementData.propertyAddress}</p>
                                    <p><strong>Unit Name/Number:</strong> {agreementData.unitName} &nbsp;|&nbsp; <strong>Unit Type:</strong> {agreementData.unitType}</p>
                                    <p><strong>Authorised Occupants:</strong> {agreementData.occupants}</p>
                                    <p>The Premises shall be used strictly and exclusively as a private residence and not for unlawful, noisy, or unauthorised commercial activities.</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">2. Tenancy Period</div>
                                <div className="doc-clause-body">
                                    <p><strong>Commencement Date:</strong> {agreementData.commencementDate} &nbsp;|&nbsp; <strong>End Date:</strong> {agreementData.endDate}</p>
                                    <p><strong>Term:</strong> {agreementData.termType}</p>
                                    <p>Any renewal or extension must be agreed upon in writing by both Parties at least one calendar month prior to expiration.</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">3. Rent</div>
                                <div className="doc-clause-body">
                                    <p><strong>Monthly Rent:</strong> ZMW K{agreementData.rentAmount}, payable in advance on or before the <strong>{agreementData.dueDay}</strong> day of each calendar month.</p>
                                    <p><strong>Payment Method:</strong> {agreementData.paymentMethod}</p>
                                    <p><strong>Payment Details:</strong> {agreementData.paymentDetails}</p>
                                    <p>The Tenant shall retain valid receipts or electronic proof of payment and shall not withhold, reduce, or deduct rent without the Landlord’s prior written consent or lawful court authority.</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">4. Security Deposit</div>
                                <div className="doc-clause-body">
                                    <p><strong>Refundable Security Deposit:</strong> ZMW K{agreementData.depositAmount}, payable prior to occupation.</p>
                                    <p>The deposit may be applied against unpaid rent, outstanding utilities, Tenant-caused damages, missing keys/fittings, or restoring unauthorised structural alterations. Normal fair wear and tear shall strictly not be deducted.</p>
                                    <p>The remaining balance shall be refunded within <strong>fourteen (14) business days</strong> after the Tenant vacates, hands over all keys, and settles outstanding utility liabilities. The deposit shall not be applied by the Tenant as the final month's rent without explicit written approval.</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">5. Utilities and Services</div>
                                <div className="doc-clause-body">
                                    <table className="doc-table">
                                        <thead>
                                            <tr>
                                                <th>Service / Utility</th>
                                                <th style={{ width: '100px', textAlign: 'center' }}>Landlord</th>
                                                <th style={{ width: '100px', textAlign: 'center' }}>Tenant</th>
                                                <th>Remarks / Metering</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Electricity (ZESCO)</td>
                                                <td className="doc-check-cell">{agreementData.electricityParty === 'Landlord' ? '☑' : '☐'}</td>
                                                <td className="doc-check-cell">{agreementData.electricityParty === 'Tenant' ? '☑' : '☐'}</td>
                                                <td>Prepaid token meter loaded directly by Tenant</td>
                                            </tr>
                                            <tr>
                                                <td>Water Supply</td>
                                                <td className="doc-check-cell">{agreementData.waterParty === 'Landlord' ? '☑' : '☐'}</td>
                                                <td className="doc-check-cell">{agreementData.waterParty === 'Tenant' ? '☑' : '☐'}</td>
                                                <td>Borehole / Municipal water supply</td>
                                            </tr>
                                            <tr>
                                                <td>Refuse Collection</td>
                                                <td className="doc-check-cell">{agreementData.refuseParty === 'Landlord' ? '☑' : '☐'}</td>
                                                <td className="doc-check-cell">{agreementData.refuseParty === 'Tenant' ? '☑' : '☐'}</td>
                                                <td>Weekly municipal / franchise refuse collection</td>
                                            </tr>
                                            <tr>
                                                <td>Security & Service Charge</td>
                                                <td className="doc-check-cell">{agreementData.securityParty === 'Landlord' ? '☑' : '☐'}</td>
                                                <td className="doc-check-cell">{agreementData.securityParty === 'Tenant' ? '☑' : '☐'}</td>
                                                <td>Electric perimeter fence, guard & rapid response</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">6. Landlord’s Responsibilities</div>
                                <div className="doc-clause-body">
                                    <ul>
                                        <li>Afford the Tenant quiet and peaceful enjoyment of the Premises without unlawful interference.</li>
                                        <li>Maintain the structural elements, roof, exterior walls, main electrical supply mains, and main plumbing/drainage systems in tenantable repair.</li>
                                        <li>Attend to reported major defects within a reasonable turnaround period.</li>
                                        <li>Furnish the Tenant with official receipts or acknowledged digital transaction ledgers for all sums received.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">7. Tenant’s Responsibilities</div>
                                <div className="doc-clause-body">
                                    <ul>
                                        <li>Pay agreed monthly rent and utility charges promptly when due.</li>
                                        <li>Keep the Premises, interior fixtures, and grounds in a clean, sanitary, and tenantable condition.</li>
                                        <li>Promptly report any plumbing leaks, electrical faults, structural cracks, or security hazards to the Landlord.</li>
                                        <li>Bear costs of repair for any physical damage occasioned by negligence or deliberate act of the Tenant, occupants, or invitees (fair wear and tear excepted).</li>
                                        <li>Refrain from causing excessive noise, public nuisance, or breach of peace to neighboring residents.</li>
                                        <li>Deliver up vacant possession with all keys, security fobs, and access devices upon termination.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">8. Alterations, Subletting and Pets</div>
                                <div className="doc-clause-body">
                                    <p>The Tenant shall strictly not paint, drill, erect partitions, alter electrical or plumbing fittings, change security locks, sublet, assign, or part with possession of the Premises without prior written permission of the Landlord.</p>
                                    <p><strong>Pets:</strong> {agreementData.petsPermitted}</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">9. Inspection and Access</div>
                                <div className="doc-clause-body">
                                    <p>The Landlord or authorised representative may enter the Premises for inspection, essential maintenance, repairs, or showing prospective purchasers/tenants during the final month. Except in an emergency, at least <strong>twenty-four (24) hours’ advance written notice</strong> shall ordinarily be given, and entry shall be scheduled during reasonable daytime hours. The Tenant shall not unreasonably withhold access.</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">10. Termination & Statutory Protections</div>
                                <div className="doc-clause-body">
                                    <p>Either Party may terminate a periodic monthly tenancy by serving at least <strong>one (1) calendar month’s written notice</strong>. A fixed-term tenancy expires on its stated date unless renewed in writing.</p>
                                    <p>In accordance with the <strong>Rent Act (Cap 206 of the Laws of Zambia)</strong>, where rent is overdue or material breach occurs, the Landlord shall issue written notice specifying the remedy period. Recovery of possession shall strictly follow the statutory process of law. <strong>The Landlord is strictly barred from unlawful self-help evictions, lockouts, seizing personal effects, or terminating essential power/water supplies.</strong></p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">11. Vacating the Premises</div>
                                <div className="doc-clause-body">
                                    <p>Prior to handover, the Tenant shall settle all accrued utility bills, remove personal belongings and refuse, hand over all sets of keys, and participate in a formal joint exit inspection.</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">12. Notices & Governing Law</div>
                                <div className="doc-clause-body">
                                    <p>Notices may be served by hand delivery, registered post, email, or verified WhatsApp messaging. This Agreement is governed by the laws of the <strong>Republic of Zambia</strong>, including the <strong>Rent Act (Chapter 206)</strong>.</p>
                                </div>
                            </div>

                            <div className="doc-clause">
                                <div className="doc-clause-title">13. Property Condition & Recorded Defects</div>
                                <div className="doc-clause-body">
                                    <p>{agreementData.recordedDefects}</p>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="doc-signatures-section">
                                <div className="doc-clause-title">14. Signatures & Digital Execution</div>
                                <div className="doc-signatures-grid">
                                    {/* Landlord Box */}
                                    <div className="doc-signature-box">
                                        <div className="doc-sig-title">Landlord / Authorized Agent</div>
                                        {landlordSig ? (
                                            <div className="doc-sig-stamp">
                                                <div><strong>✓ DIGITALLY VERIFIED</strong></div>
                                                <div>{landlordSig.signatureData}</div>
                                                <div>Timestamp: {new Date(landlordSig.signedAt).toLocaleString()}</div>
                                            </div>
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                                Pending landlord execution stamp
                                            </div>
                                        )}
                                        <div className="doc-sig-line">
                                            <span>Name: {agreementData.landlordName}</span>
                                            <span>Date: {landlordSig ? new Date(landlordSig.signedAt).toLocaleDateString() : '____/____/20__'}</span>
                                        </div>
                                    </div>

                                    {/* Tenant Box */}
                                    <div className="doc-signature-box">
                                        <div className="doc-sig-title">Tenant</div>
                                        {tenantSig ? (
                                            <div className="doc-sig-stamp" style={{ borderColor: '#0284c7', background: '#f0f9ff', color: '#0369a1' }}>
                                                <div><strong>✓ DIGITALLY ACKNOWLEDGED</strong></div>
                                                <div>{tenantSig.signatureData}</div>
                                                <div>Timestamp: {new Date(tenantSig.signedAt).toLocaleString()}</div>
                                            </div>
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                                Pending tenant execution signature
                                            </div>
                                        )}
                                        <div className="doc-sig-line">
                                            <span>Name: {agreementData.tenantName}</span>
                                            <span>NRC: {agreementData.tenantNrc}</span>
                                        </div>
                                    </div>

                                    {/* Witness Box */}
                                    <div className="doc-signature-box" style={{ gridColumn: 'span 2' }}>
                                        <div className="doc-sig-title">Witness (Property Manager / Legal Officer)</div>
                                        <div className="doc-sig-line" style={{ marginTop: '0.5rem' }}>
                                            <span>Witness Name: {agreementData.witnessName}</span>
                                            <span>NRC: {agreementData.witnessNrc}</span>
                                            <span>Date: {agreementData.witnessDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-disclaimer">
                                REMIS Legal Document Generator • Republic of Zambia Tenancy Compliance • Standard Rent Act Cap 206 Form
                            </div>
                        </div>
                        </ProtectedDocumentViewer>
                    ) : (
                        /* Edit / Customize Form */
                        <div className="edit-form-container">
                            <div className="edit-section">
                                <h3>1. Landlord Information</h3>
                                <div className="edit-grid">
                                    <div className="edit-field">
                                        <label>Landlord / Managing Entity</label>
                                        <input
                                            value={agreementData.landlordName}
                                            onChange={e => setAgreementData({ ...agreementData, landlordName: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>NRC / PACRA Reg Number</label>
                                        <input
                                            value={agreementData.landlordNrc}
                                            onChange={e => setAgreementData({ ...agreementData, landlordNrc: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Official Address</label>
                                        <input
                                            value={agreementData.landlordAddress}
                                            onChange={e => setAgreementData({ ...agreementData, landlordAddress: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Contact Phone</label>
                                        <input
                                            value={agreementData.landlordPhone}
                                            onChange={e => setAgreementData({ ...agreementData, landlordPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="edit-section">
                                <h3>2. Tenant Information</h3>
                                <div className="edit-grid">
                                    <div className="edit-field">
                                        <label>Full Name</label>
                                        <input
                                            value={agreementData.tenantName}
                                            onChange={e => setAgreementData({ ...agreementData, tenantName: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>National Registration Card (NRC) / Passport</label>
                                        <input
                                            value={agreementData.tenantNrc}
                                            onChange={e => setAgreementData({ ...agreementData, tenantNrc: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Permanent Address</label>
                                        <input
                                            value={agreementData.tenantAddress}
                                            onChange={e => setAgreementData({ ...agreementData, tenantAddress: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Phone / WhatsApp</label>
                                        <input
                                            value={agreementData.tenantPhone}
                                            onChange={e => setAgreementData({ ...agreementData, tenantPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="edit-section">
                                <h3>3. Premises & Rental Terms</h3>
                                <div className="edit-grid">
                                    <div className="edit-field">
                                        <label>Unit Type</label>
                                        <select
                                            value={agreementData.unitType}
                                            onChange={e => setAgreementData({ ...agreementData, unitType: e.target.value })}
                                        >
                                            <option>Studio Unit</option>
                                            <option>Two-bedroom duplex</option>
                                            <option>Standalone House</option>
                                            <option>Three-bedroom Apartment</option>
                                            <option>Commercial Premises</option>
                                            <option>Other Residential</option>
                                        </select>
                                    </div>
                                    <div className="edit-field">
                                        <label>Authorised Occupants</label>
                                        <input
                                            value={agreementData.occupants}
                                            onChange={e => setAgreementData({ ...agreementData, occupants: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Monthly Rent (ZMW)</label>
                                        <input
                                            value={agreementData.rentAmount}
                                            onChange={e => setAgreementData({ ...agreementData, rentAmount: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Refundable Security Deposit (ZMW)</label>
                                        <input
                                            value={agreementData.depositAmount}
                                            onChange={e => setAgreementData({ ...agreementData, depositAmount: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Rent Due Day</label>
                                        <input
                                            value={agreementData.dueDay}
                                            onChange={e => setAgreementData({ ...agreementData, dueDay: e.target.value })}
                                            placeholder="e.g. 1st or 5th of each month"
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Payment Method & Account</label>
                                        <input
                                            value={agreementData.paymentDetails}
                                            onChange={e => setAgreementData({ ...agreementData, paymentDetails: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="edit-section">
                                <h3>4. Utilities Matrix (Responsibility Allocation)</h3>
                                <table className="util-editor-table">
                                    <thead>
                                        <tr>
                                            <th>Utility Item</th>
                                            <th>Responsible Party</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Electricity (ZESCO)</td>
                                            <td>
                                                <select
                                                    value={agreementData.electricityParty}
                                                    onChange={e => setAgreementData({ ...agreementData, electricityParty: e.target.value })}
                                                >
                                                    <option value="Tenant">Tenant Responsibility</option>
                                                    <option value="Landlord">Landlord Included</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Water Supply (Borehole / Municipal)</td>
                                            <td>
                                                <select
                                                    value={agreementData.waterParty}
                                                    onChange={e => setAgreementData({ ...agreementData, waterParty: e.target.value })}
                                                >
                                                    <option value="Landlord">Landlord Included</option>
                                                    <option value="Tenant">Tenant Responsibility</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Refuse Collection</td>
                                            <td>
                                                <select
                                                    value={agreementData.refuseParty}
                                                    onChange={e => setAgreementData({ ...agreementData, refuseParty: e.target.value })}
                                                >
                                                    <option value="Landlord">Landlord Included</option>
                                                    <option value="Tenant">Tenant Responsibility</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Security & Rapid Response</td>
                                            <td>
                                                <select
                                                    value={agreementData.securityParty}
                                                    onChange={e => setAgreementData({ ...agreementData, securityParty: e.target.value })}
                                                >
                                                    <option value="Landlord">Landlord Included</option>
                                                    <option value="Tenant">Tenant Responsibility</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="edit-section">
                                <h3>5. Condition Report & Recorded Defects</h3>
                                <div className="edit-field full-width">
                                    <label>Initial Move-in Condition & Recorded Defects</label>
                                    <textarea
                                        rows={3}
                                        value={agreementData.recordedDefects}
                                        onChange={e => setAgreementData({ ...agreementData, recordedDefects: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="edit-section">
                                <h3>6. Witness Details</h3>
                                <div className="edit-grid">
                                    <div className="edit-field">
                                        <label>Witness Name</label>
                                        <input
                                            value={agreementData.witnessName}
                                            onChange={e => setAgreementData({ ...agreementData, witnessName: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Witness NRC</label>
                                        <input
                                            value={agreementData.witnessNrc}
                                            onChange={e => setAgreementData({ ...agreementData, witnessNrc: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn-primary"
                                style={{ marginTop: '1.5rem', width: '100%' }}
                                onClick={() => setActiveTab('document')}
                            >
                                <CheckCircle size={18} /> Update & Preview Printable Document
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaseAgreementModal;
