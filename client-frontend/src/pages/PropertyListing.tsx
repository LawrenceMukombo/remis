import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, ScaleControl, LayersControl } from 'react-leaflet';
import { Search, MapPin, SlidersHorizontal, Building2, Home, Navigation, LayoutGrid, List, Crosshair, Layers, Maximize, Eye, Factory, LandPlot, Trees, Key, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  listing_type: string;
  sale_price?: number;
  latitude?: number;
  longitude?: number;
  images: string[];
  location?: { name: string };
}

const getPropertyTypeIcon = (type: string, size = 18) => {
  switch (type.toUpperCase()) {
    case 'RESIDENTIAL': return <Home size={size} />;
    case 'COMMERCIAL': return <Building2 size={size} />;
    case 'INDUSTRIAL': return <Factory size={size} />;
    case 'LAND': return <LandPlot size={size} />;
    default: return <Home size={size} />;
  }
};

const getPropertyTypeSvg = (type: string, size = 20) => {
  const common = `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}"`;
  switch (type.toUpperCase()) {
    case 'RESIDENTIAL': return `<svg ${common}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case 'COMMERCIAL': return `<svg ${common}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`;
    case 'INDUSTRIAL': return `<svg ${common}><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>`;
    case 'LAND': return `<svg ${common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m12 21 8-4.5"/><path d="m12 12 8-4.5"/><path d="M12 12V3"/></svg>`;
    default: return `<svg ${common}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'AVAILABLE': return '#10b981'; // Emerald
    case 'LEASED':
    case 'SOLD':
    case 'OCCUPIED': return '#f43f5e'; // Rose/Red
    default: return '#64748b';
  }
};

const getListingTypeInfo = (type: string) => {
  if (type.toUpperCase() === 'LEASE') {
    return { color: '#6366f1', icon: <Key size={14} />, label: 'FOR LEASE' };
  }
  return { color: '#f59e0b', icon: <Tag size={14} />, label: 'FOR SALE' };
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const LocateButton = () => {
  const map = useMap();
  const handleLocate = () => {
    map.locate().on('locationfound', (e) => {
      map.flyTo(e.latlng, 15, { duration: 1.5 });
    });
  };
  return (
    <div className="map-custom-control locate-ctrl">
      <button onClick={handleLocate} title="My Location"><Crosshair size={18} /></button>
    </div>
  );
};

const MapActions = ({ properties }: { properties: Property[] }) => {
  const map = useMap();
  const flyToAll = () => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map(p => [p.latitude!, p.longitude!] as [number, number]));
    map.flyToBounds(bounds, { padding: [50, 50], duration: 2 });
  };

  return (
    <div className="map-custom-control actions-ctrl">
      <button onClick={flyToAll} title="View All Results"><Maximize size={18} /></button>
    </div>
  );
};

const PropertyMap: React.FC<{ properties: Property[], center: [number, number], navigate: any }> = ({ properties, center, navigate }) => {
  return (
    <div className="map-relative-wrapper">
      <MapContainer
        center={center}
        zoom={13}
        className="leaflet-container-portal"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Modern Street">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Dark Theme">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <LocateButton />
        <MapActions properties={properties} />

        {properties.map(prop => {
          if (!prop.latitude || !prop.longitude) return null;

          const statusColor = getStatusColor(prop.status);
          const iconSvg = getPropertyTypeSvg(prop.type, 20);

          const typeIconMarkup = `
            <div style="
              background-color: ${statusColor};
              color: white;
              padding: 8px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              border: 2px solid white;
              width: 36px;
              height: 36px;
            ">
              ${iconSvg}
            </div>
          `;

          const customIcon = L.divIcon({
            html: typeIconMarkup,
            className: 'custom-map-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          return (
            <Marker
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={customIcon}
            >
              <Popup offset={[0, -10]}>
                <div className="map-popup-premium">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: 'white',
                      backgroundColor: statusColor,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {prop.status}
                    </span>
                    <span style={{ color: getListingTypeInfo(prop.listing_type).color, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700 }}>
                      {getListingTypeInfo(prop.listing_type).icon}
                      {prop.listing_type}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{prop.name}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                    <MapPin size={12} /> {prop.address || prop.location?.name}
                  </p>
                  <div className="popup-footer">
                    <span className="popup-price">K{prop.sale_price?.toLocaleString()}</span>
                    <button
                      onClick={() => navigate(`/property/${prop.id}`)}
                      className="popup-btn"
                    >
                      <Eye size={14} /> Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

const PropertyListing: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    listing_type: '',
    minPrice: '',
    maxPrice: ''
  });
  const [tenantConfig, setTenantConfig] = useState<any>(null);

  useEffect(() => {
    fetchTenantSettings();
    fetchProperties();
  }, [searchTerm, filters]);

  const fetchTenantSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/tenant/settings`);
      const data = await res.json();
      if (data.name) {
        setTenantConfig(data);
      }
    } catch (e) {
      console.error("Failed to fetch tenant settings", e);
    }
  };

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.listing_type && { listing_type: filters.listing_type }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      });
      const res = await fetch(`${API_BASE}/properties?${params}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mapCenter: [number, number] = [-9.4438, 147.1803]; // PNG Default

  return (
    <div className="listing-page">
      {/* Navbar Container */}
      <header className="listing-nav glass">
        <div className="nav-left">
          {tenantConfig?.config?.branding?.logo ? (
            <img src={tenantConfig.config.branding.logo} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
          ) : (
            <Building2 className="logo-icon" />
          )}
          <span className="logo-text" style={tenantConfig?.config?.branding?.primaryColor ? { background: 'none', WebkitTextFillColor: 'initial', color: tenantConfig.config.branding.primaryColor } : {}}>
            {tenantConfig?.name || 'REMIS Portal'}
          </span>
        </div>

        <div className="search-bar-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name, province, district, or LLG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-container">
            <button
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {(filters.type || filters.status || filters.listing_type || filters.minPrice || filters.maxPrice) && (
                <span className="filter-dot" />
              )}
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="filter-popover glass"
                >
                  <div className="filter-group">
                    <label>Property Type</label>
                    <div className="filter-options">
                      {['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'LAND'].map(t => (
                        <button
                          key={t}
                          className={filters.type === t ? 'selected' : ''}
                          onClick={() => setFilters({ ...filters, type: filters.type === t ? '' : t })}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>Listing Type</label>
                    <div className="filter-options">
                      {['LEASE', 'SALE'].map(t => (
                        <button
                          key={t}
                          className={filters.listing_type === t ? 'selected' : ''}
                          onClick={() => setFilters({ ...filters, listing_type: filters.listing_type === t ? '' : t })}
                        >
                          For {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>Price Range (K)</label>
                    <div className="price-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="filter-footer">
                    <button className="clear-link" onClick={() => setFilters({ type: '', status: '', listing_type: '', minPrice: '', maxPrice: '' })}>
                      Clear all
                    </button>
                    <button className="apply-btn" onClick={() => setShowFilters(false)}>
                      Show {properties.length} Results
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="nav-right">
          <button className="login-btn" onClick={() => window.location.href = 'http://localhost:3000/login'}>
            Sign In
          </button>
        </div>
      </header>

      <main className="listing-main">
        {/* Sidebar Results */}
        <section className={`results-sidebar ${viewMode === 'map' ? 'hidden' : ''}`}>
          <div className="sidebar-header">
            <h2>{properties.length} properties found</h2>
            <div className="view-selector">
              <button className={viewMode === 'split' ? 'active' : ''} onClick={() => setViewMode('split')}><LayoutGrid size={16} /></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={16} /></button>
            </div>
          </div>

          <div className="scroll-results">
            <AnimatePresence>
              {properties.map(prop => {
                const listingInfo = getListingTypeInfo(prop.listing_type);
                const statusColor = getStatusColor(prop.status);

                return (
                  <motion.div
                    key={prop.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`property-card-small premium-card ${hoveredId === prop.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredId(prop.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => navigate(`/property/${prop.id}`)}
                  >
                    <div className="card-image-box">
                      {prop.images[0] ? (
                        <img src={prop.images[0]} alt={prop.name} />
                      ) : (
                        <div className="placeholder-img"><Home size={32} /></div>
                      )}

                      <div className="badge-stack">
                        <div className="listing-badge" style={{ backgroundColor: listingInfo.color }}>
                          {listingInfo.icon}
                          {listingInfo.label}
                        </div>
                        <div className="status-badge-overlay" style={{ backgroundColor: statusColor }}>
                          {prop.status}
                        </div>
                      </div>
                    </div>
                    <div className="card-info">
                      <h3 className="prop-name">{prop.name}</h3>
                      <div className="price-label">
                        {prop.sale_price ? `K${prop.sale_price.toLocaleString()}` : 'Contact for Price'}
                      </div>
                      <p className="prop-addr"><MapPin size={12} /> {prop.address || prop.location?.name}</p>
                      <div className="prop-tags">
                        <span className="type-tag">
                          {getPropertyTypeIcon(prop.type, 12)}
                          {prop.type}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        <section className={`map-viewport ${viewMode === 'list' ? 'hidden' : ''}`}>
          <PropertyMap properties={properties} center={mapCenter} navigate={navigate} />
        </section>
      </main>

      <style>{`
        .listing-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .listing-nav {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 1000;
          box-shadow: var(--shadow-sm);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          color: var(--primary);
        }

        .logo-text {
          font-family: 'Outfit';
          font-weight: 800;
          font-size: 1.25rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .search-bar-container {
          display: flex;
          gap: 1rem;
          flex: 1;
          max-width: 600px;
          margin: 0 2rem;
        }

        .search-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          min-width: 0;
          box-sizing: border-box;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
        }

        .search-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border-radius: 99px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .search-wrapper input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1.25rem;
          border-radius: 99px;
          border: 1px solid var(--border);
          background: white;
          color: var(--text-main);
          font-weight: 500;
          cursor: pointer;
          min-width: max-content;
          box-sizing: border-box;
        }

        .listing-main {
          flex: 1;
          display: flex;
          position: relative;
        }

        .results-sidebar {
          width: 420px;
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h2 {
          font-size: 1.125rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .scroll-results {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .property-card-small {
          display: flex;
          gap: 1.25rem;
          padding: 1rem;
          cursor: pointer;
          border-radius: var(--radius-lg);
        }

        .property-card-small.hovered {
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }

        .card-image-box {
          width: 140px;
          height: 100px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          background: #f1f5f9;
        }

        .card-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge-stack {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          z-index: 2;
          max-width: calc(100% - 1rem);
        }

        .listing-badge {
          color: white;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 4px;
          width: fit-content;
        }

        .status-badge-overlay {
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          width: fit-content;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .type-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          color: #475569 !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          font-weight: 700 !important;
        }

        .card-info {
          flex: 1;
        }

        .price-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .prop-name {
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 0.15rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prop-addr {
          font-size: 0.875rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 0.75rem;
        }

        .prop-tags {
          display: flex;
          gap: 0.5rem;
        }

        .prop-tags span {
          background: var(--bg-app);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .map-viewport {
          flex: 1;
          background: #e2e8f0;
        }

        .hidden {
          display: none !important;
        }

        * {
          box-sizing: border-box;
        }

        .leaflet-container-portal {
          height: 100%;
          width: 100%;
        }

        .map-popup-premium {
          min-width: 200px;
          padding: 0.5rem;
        }

        .map-popup-premium h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main);
          font-family: 'Outfit';
        }

        .map-popup-premium p {
          margin: 0 0 0.75rem 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .popup-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }

        .popup-price {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary);
        }

        .map-relative-wrapper {
          position: relative;
          height: 100%;
          width: 100%;
        }

        .map-custom-control {
          position: absolute;
          z-index: 1000;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .map-custom-control.locate-ctrl {
          top: 80px;
          right: 12px;
        }

        .map-custom-control.actions-ctrl {
          top: 130px;
          right: 12px;
        }

        .map-custom-control button {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: none;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s;
        }

        .map-custom-control button:hover {
          background: #f8fafc;
          color: var(--primary);
        }

        .map-custom-control button:active {
          transform: scale(0.9);
        }

        .popup-btn {
          padding: 6px 14px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 10px var(--primary-glow);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .popup-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px var(--primary-glow);
        }

        .filter-container {
          position: relative;
        }

        .filter-btn.active {
          border-color: var(--primary);
          background: var(--bg-app);
          color: var(--primary);
        }

        .filter-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          position: absolute;
          top: 6px;
          right: 6px;
          box-shadow: 0 0 0 2px white;
        }

        .filter-popover {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 380px;
          padding: 1.75rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
        }

        .filter-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-options button {
          padding: 0.5rem 1rem;
          border-radius: 99px;
          border: 1px solid var(--border);
          background: white;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-options button.selected {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .price-inputs input {
          flex: 1;
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          outline: none;
          font-size: 0.9rem;
        }

        .filter-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .clear-link {
          background: none;
          border: none;
          color: var(--text-muted);
          text-decoration: underline;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .apply-btn {
          background: var(--text-main);
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .results-sidebar {
            width: 350px;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyListing;
