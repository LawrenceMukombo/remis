import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bed, Bath, Share2, Heart,
  Calendar, CheckCircle2, MessageSquare, Building2, ShieldCheck,
  ChevronRight, Info, Home, Grid, Factory, LandPlot, Key, Tag, Phone, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduleViewingModal from '../components/ScheduleViewingModal';

const API_BASE = 'http://localhost:4000/api';

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    message: ''
  });

  useEffect(() => {
    fetchProperty();
    const favorites = JSON.parse(localStorage.getItem('remis_favorites') || '[]');
    setIsFavorited(favorites.includes(id));
  }, [id]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProperty = async () => {
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`);
      const data = await res.json();
      setProperty(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('remis_favorites') || '[]');
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter((favId: string) => favId !== id);
      showToast('Removed from favorites');
    } else {
      newFavorites = [...favorites, id];
      showToast('Added to favorites!', 'success');
    }
    localStorage.setItem('remis_favorites', JSON.stringify(newFavorites));
    setIsFavorited(!isFavorited);
  };

  const handleShare = async () => {
    const shareData = {
      title: property.name,
      text: `Check out this ${property.type} at ${property.address}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/crm/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone || contactForm.whatsapp,
          propertyName: property.name,
          details: contactForm.message,
          type: property.listing_type || 'INQUIRY',
          propertyId: id
        })
      });

      if (res.ok) {
        showToast('Message sent to manager!', 'success');
        setShowContactModal(false);
        setContactForm({ name: '', email: '', phone: '', whatsapp: '', message: '' });
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  const getPropertyTypeIcon = (type: string, size = 20) => {
    if (!type) return <Home size={size} />;
    switch (type.toUpperCase()) {
      case 'RESIDENTIAL': return <Home size={size} />;
      case 'COMMERCIAL': return <Building2 size={size} />;
      case 'INDUSTRIAL': return <Factory size={size} />;
      case 'LAND': return <LandPlot size={size} />;
      default: return <Home size={size} />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#64748b';
    switch (status.toUpperCase()) {
      case 'AVAILABLE': return '#10b981';
      case 'LEASED':
      case 'SOLD':
      case 'OCCUPIED': return '#f43f5e';
      default: return '#64748b';
    }
  };

  const getListingInfo = (type: string) => {
    if (!type || type.toUpperCase() !== 'LEASE') {
      return { color: '#f59e0b', icon: <Tag size={14} />, label: 'FOR SALE' };
    }
    return { color: '#6366f1', icon: <Key size={14} />, label: 'FOR LEASE' };
  };

  if (loading) return <div className="loading-screen">Loading Property...</div>;
  if (!property) return <div className="error-screen">Property not found.</div>;

  return (
    <div className="details-page">
      <nav className="details-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back to Search</span>
        </button>
        <div className="nav-actions">
          <button className="icon-action" onClick={handleShare} title="Share Property"><Share2 size={20} /></button>
          <button
            className={`icon-action favorite-btn ${isFavorited ? 'active' : ''}`}
            onClick={toggleFavorite}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={20} fill={isFavorited ? 'var(--accent)' : 'none'} color={isFavorited ? 'var(--accent)' : 'currentColor'} />
          </button>
        </div>
      </nav>

      <main className="details-content">
        {(() => {
          const isLand = property.type === 'LAND';
          const isCommercial = property.type === 'COMMERCIAL';
          const isIndustrial = property.type === 'INDUSTRIAL';
          const isResidential = property.type === 'RESIDENTIAL' || (!isLand && !isCommercial && !isIndustrial);
          const isSale = property.listing_type === 'SALE';

          const galleryImages = (property.images && property.images.length > 0)
            ? property.images
            : (isLand
                ? [
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200',
                    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600'
                  ]
                : [
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600'
                  ]);

          const contactPhone = property.ownerPhone || property.tenant?.phone || '+260971234567';
          const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
          const contactOwnerName = property.ownerName || property.tenant?.name || 'Verified Owner';

          return (
            <>
              <section className="gallery-section">
                <div className="main-image">
                  <img src={galleryImages[0]} alt={property.name} />
                </div>
                <div className="side-images">
                  <div className="img-box"><img src={galleryImages[1] || galleryImages[0]} alt="Gallery 2" /></div>
                  <div className="img-box"><img src={galleryImages[2] || galleryImages[0]} alt="Gallery 3" /></div>
                  <button className="all-photos-btn"><Grid size={16} /> Show all {galleryImages.length} photos</button>
                </div>
              </section>

              <div className="details-grid">
                <div className="main-info">
                  <header className="info-header">
                    <div className="header-top">
                      <span className="listing-type" style={{ backgroundColor: getListingInfo(property.listing_type).color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getListingInfo(property.listing_type).icon}
                        {getListingInfo(property.listing_type).label}
                      </span>
                      <span className="property-status" style={{ backgroundColor: getStatusColor(property.status) }}>{property.status}</span>
                    </div>
                    <h1>{property.name}</h1>
                    <p className="address-line"><MapPin size={18} /> {property.address}</p>

                    <div className="quick-specs">
                      <div className="spec-item">{getPropertyTypeIcon(property.type)} <span>{property.type}</span></div>
                      {isLand && (
                        <>
                          <div className="spec-item"><LandPlot size={20} /> <span>{property.landArea ? `${property.landArea} sqm` : (property.specifications?.land_size ? `${property.specifications.land_size} ${property.specifications.land_size_unit || 'sqm'}` : 'Demarcated Land')}</span></div>
                          <div className="spec-item"><ShieldCheck size={20} /> <span>{property.specifications?.title_tenure?.replace(/_/g, ' ') || 'State Leasehold Title'}</span></div>
                        </>
                      )}
                      {isCommercial && (
                        <>
                          <div className="spec-item"><Building2 size={20} /> <span>{property.specifications?.lettable_area_sqm || property.landArea || 450} sqm Lettable</span></div>
                          <div className="spec-item"><Grid size={20} /> <span>{property.specifications?.parking_bays ? `${property.specifications.parking_bays} Dedicated Bays` : 'On-Site Parking'}</span></div>
                        </>
                      )}
                      {isIndustrial && (
                        <>
                          <div className="spec-item"><Factory size={20} /> <span>{property.specifications?.warehouse_area_sqm || property.landArea || 1200} sqm Warehouse</span></div>
                          <div className="spec-item"><Grid size={20} /> <span>{property.specifications?.eaves_height_meters ? `${property.specifications.eaves_height_meters}m Eaves` : 'High Clearance'}</span></div>
                        </>
                      )}
                      {isResidential && (
                        <>
                          <div className="spec-item"><Bed size={20} /> <span>{property.specifications?.bedrooms || 3} Bedrooms</span></div>
                          <div className="spec-item"><Bath size={20} /> <span>{property.specifications?.bathrooms || 2} Bathrooms</span></div>
                        </>
                      )}
                    </div>
                  </header>

                  <section className="description">
                    <h3>About this property</h3>
                    <p>{property.description || (isLand 
                        ? 'Prime demarcated land parcel in a strategic location with surveyed boundary beacons, road accessibility, and authentic title registry documentation.'
                        : isCommercial
                        ? 'High-profile commercial premises featuring flexible workspace configurations, dedicated parking, and essential utility infrastructure.'
                        : isIndustrial
                        ? 'Heavy-duty industrial facility equipped with warehouse clear-span, truck articulation yard, and high-capacity electrical supply.'
                        : 'Welcome to this quality property. Located in a prime neighborhood, offering comfort, security, and modern convenience.'
                    )}</p>
                  </section>

                  <section className="features-section">
                    <h3>Features & Specifications</h3>
                    <div className="features-grid">
                      {isLand && (
                        <>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Survey Beacons in Place</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Clean Title Deed Records</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Road Frontage Access</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Power / Water Ready</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Approved Land Zoning</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Cadastral Survey Verified</div>
                        </>
                      )}
                      {isCommercial && (
                        <>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Standby Power Generator</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> High-Speed Fibre Internet</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Dedicated Customer Parking</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Passenger & Goods Elevators</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> 24/7 Security Access</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Dedicated Borehole Water</div>
                        </>
                      )}
                      {isIndustrial && (
                        <>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Superlink Truck Turning Circle</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> 3-Phase Industrial Power</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Heavy Vehicle Hardstand Yard</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Automated Roller Shutters</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Fire Hydrant & Hose System</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> 24/7 Guarded Gated Entry</div>
                        </>
                      )}
                      {isResidential && (
                        <>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> 24/7 Perimeter Security</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Backup Power / Solar Inverter</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Dedicated Borehole + Tank</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Electric Fence & Motorized Gate</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Fitted Kitchen & Amenities</div>
                          <div className="feature-item"><CheckCircle2 size={18} color="#10b981" /> Paved Driveway & Parking</div>
                        </>
                      )}
                    </div>
                  </section>
                </div>

                <aside className="booking-card premium-card sticky-card">
                  <div className="price-box">
                    <span className="price-value">K{property.sale_price?.toLocaleString()}</span>
                    <span className="price-period">{property.listing_type === 'LEASE' ? '/ month' : ''}</span>
                  </div>

                  <div className="booking-form">
                    <div className="input-group">
                      <label>{isSale ? 'Target Acquisition Date' : 'Likely Move-in Date'}</label>
                      <input type="date" className="booking-input" />
                    </div>
                    <button
                      className="btn-primary w-full"
                      style={{ background: `linear-gradient(135deg, ${getListingInfo(property.listing_type).color} 0%, var(--secondary) 100%)` }}
                      onClick={() => navigate(`/apply/${id}`)}
                    >
                      {isSale ? 'Submit Purchase Intent' : 'Apply for Lease'}
                      <ChevronRight size={18} />
                    </button>
                    
                    <button
                      className="btn-outline w-full mt-2"
                      style={{ borderColor: '#0284c7', color: '#0284c7', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={() => setShowViewingModal(true)}
                    >
                      <Calendar size={18} /> Schedule In-Person Viewing
                    </button>
                  </div>

                  <p className="booking-footer">You won't be charged yet. This initiates your formal interest.</p>

                  <div className="host-box">
                    <div className="host-info">
                      <h4>Managed by {contactOwnerName}</h4>
                      <p>Verified Property Lister</p>
                    </div>
                    <ShieldCheck size={32} color="#10b981" />
                  </div>

                  <div className="communication-shield">
                    <div className="shield-header">
                      <ShieldCheck size={18} color="#10b981" />
                      <span className="shield-title">REMIS Communication Shield Active</span>
                    </div>
                    <div className="shield-badge-row">
                      <span className="shield-badge">Anti-Scam Protected</span>
                      <span className="shield-proxy-text">
                        {property.ownerPhone || '+260 97 ••• ••XX (REMIS Shield)'}
                      </span>
                    </div>
                    <p className="shield-desc">
                      To prevent fraud and protect deposits, communications are proxied through REMIS. Direct contact details are securely unmasked upon confirmed on-site QR viewing check-in or signed lease agreement.
                    </p>
                    <div className="shield-actions">
                      <button 
                        type="button"
                        className="shield-action-btn inquiry"
                        onClick={() => setShowContactModal(true)}
                      >
                        <MessageSquare size={15} /> Inquire via Shield
                      </button>
                      <button 
                        type="button"
                        className="shield-action-btn viewing"
                        onClick={() => setShowViewingModal(true)}
                      >
                        <Calendar size={15} /> Book Viewing Pass
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          );
        })()}
      </main>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="contact-modal premium-card"
              onClick={e => e.stopPropagation()}
            >
              <h3>Contact Property Manager</h3>
              <p>Send a direct message regarding {property.name}</p>

              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    required
                    type="text"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    required
                    type="email"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+675 ..."
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp (Optional)</label>
                    <input
                      type="text"
                      value={contactForm.whatsapp}
                      onChange={e => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                      placeholder="+675 ..."
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="I am interested in this property..."
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-text" onClick={() => setShowContactModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Send Message</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`toast toast-${toast.type}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone 2: Physical Viewing Schedule & QR Check-in Modal */}
      <ScheduleViewingModal
        property={property}
        isOpen={showViewingModal}
        onClose={() => setShowViewingModal(false)}
        onProceedToLease={() => navigate(`/apply/${id}`)}
      />

      <style>{`
        .details-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }

        .details-nav {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--text-main);
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
        }

        .icon-action {
          background: white;
          border: 1px solid var(--border);
          padding: 0.5rem;
          border-radius: 50%;
          margin-left: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gallery-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 0.75rem;
          height: 500px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 2.5rem;
        }

        .gallery-section img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .gallery-section img:hover {
          transform: scale(1.03);
        }

        .main-image {
          position: relative;
        }

        .side-images {
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 0.75rem;
          position: relative;
        }

        .all-photos-btn {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: white;
          border: 1px solid var(--text-main);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 4rem;
        }

        .header-top {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .listing-type, .property-status {
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .listing-type { background: #eef2ff; color: #4338ca; }
        .property-status { background: #ecfdf5; color: #065f46; }

        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }

        .address-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 1.125rem;
          margin-bottom: 1.5rem;
        }

        .quick-specs {
          display: flex;
          gap: 2rem;
          padding: 1.5rem 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 2rem;
        }

        .spec-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-main);
          font-weight: 500;
        }

        .description, .features-section {
          margin-bottom: 3rem;
        }

        h3 { font-size: 1.5rem; margin-bottom: 1rem; }

        .description p {
          font-size: 1.125rem;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.05rem;
        }

        .sticky-card {
          position: sticky;
          top: 2rem;
          height: fit-content;
          padding: 2rem;
        }

        .price-box {
          margin-bottom: 2rem;
        }

        .price-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
        }

        .price-period {
          color: var(--text-muted);
          font-size: 1.25rem;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .input-group {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
        }

        .input-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .booking-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 1rem;
        }

        .w-full { width: 100%; justify-content: center; }

        .booking-footer {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }

        .host-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
          border-top: 1px solid var(--border);
          margin-bottom: 1.5rem;
        }

        .host-info h4 { font-size: 1.1rem; margin-bottom: 0.25rem; }
        .host-info p { font-size: 0.875rem; color: var(--text-muted); }

        .btn-outline {
          background: white;
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
        .mb-4 { margin-bottom: 1rem; }

        .communication-shield {
          margin-top: 1rem;
          background: #f0fdf4;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }

        .shield-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0.5rem;
        }

        .shield-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #166534;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .shield-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          border: 1px solid #dcfce7;
          margin-bottom: 0.5rem;
        }

        .shield-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #15803d;
          background: #dcfce7;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .shield-proxy-text {
          font-size: 0.72rem;
          font-weight: 600;
          color: #334155;
          font-family: monospace;
        }

        .shield-desc {
          font-size: 0.72rem;
          color: #166534;
          line-height: 1.35;
          margin-bottom: 0.75rem;
        }

        .shield-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .shield-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0.55rem;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .shield-action-btn.inquiry {
          background: #0284c7;
          color: white;
        }
        .shield-action-btn.inquiry:hover {
          background: #0369a1;
        }

        .shield-action-btn.viewing {
          background: #16a34a;
          color: white;
        }
        .shield-action-btn.viewing:hover {
          background: #15803d;
        }

        .favorite-btn.active {
          border-color: var(--accent);
          background: rgba(244, 63, 94, 0.05);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .contact-modal {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
        }

        .contact-modal h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .contact-modal p { color: var(--text-muted); margin-bottom: 2rem; }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border);
          outline: none;
          transition: all 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: var(--primary); }
        .form-group textarea { min-height: 120px; resize: vertical; }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-text {
          background: none;
          border: none;
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
        }

        .toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--text-main);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 99px;
          font-weight: 600;
          box-shadow: var(--shadow-xl);
          z-index: 3000;
        }

        .toast-success { background: #10b981; }
        .toast-error { background: var(--accent); }

        @media (max-width: 768px) {
          .gallery-section { grid-template-columns: 1fr; height: 300px; }
          .side-images { display: none; }
          .details-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default PropertyDetails;
