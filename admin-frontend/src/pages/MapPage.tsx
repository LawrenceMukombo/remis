import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    MapPin, Navigation, Layers, Search, Maximize2, Minimize2,
    Compass, Globe, Sparkles, Filter, Eye, Check, ChevronDown, Crosshair, Building2
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './MapPage.css';
import L from 'leaflet';

// Fix Marker icon issue in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored markers for status
const createCustomMarkerIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div style="
                background: ${color};
                width: 28px;
                height: 28px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.35);
                border: 2px solid white;
            ">
                <div style="
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                    transform: rotate(45deg);
                "></div>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
};

const iconAvailable = createCustomMarkerIcon('#059669'); // Emerald
const iconOccupied = createCustomMarkerIcon('#4f46e5');  // Indigo
const iconMaintenance = createCustomMarkerIcon('#d97706'); // Amber

// CARTO API Key provided by user
const CARTO_API_KEY = 'cb1_2wxx_1_19a2e48a7de2e23331436131';

interface BasemapOption {
    id: string;
    name: string;
    iconText: string;
    url: string;
    attribution: string;
    subdomains?: string[];
    labelsUrl?: string;
}

const BASEMAPS: BasemapOption[] = [
    {
        id: 'carto-voyager',
        name: 'CARTO Voyager',
        iconText: '🚀',
        url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: ['a', 'b', 'c', 'd']
    },
    {
        id: 'carto-positron',
        name: 'CARTO Positron',
        iconText: '☀️',
        url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: ['a', 'b', 'c', 'd']
    },
    {
        id: 'carto-dark',
        name: 'CARTO Dark Matter',
        iconText: '🌙',
        url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: ['a', 'b', 'c', 'd']
    },
    {
        id: 'satellite',
        name: 'Satellite Aerial',
        iconText: '🛰️',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        labelsUrl: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        subdomains: ['a', 'b', 'c', 'd']
    },
    {
        id: 'osm',
        name: 'OpenStreetMap',
        iconText: '🗺️',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    {
        id: 'topo',
        name: 'Topographic',
        iconText: '⛰️',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenTopoMap (CC-BY-SA)'
    }
];

// Zambia & Global Landmark Jump Presets
const QUICK_JUMP_PRESETS = [
    { name: '🇿🇲 Zambia (Overview)', center: [-13.1339, 27.8493] as [number, number], zoom: 6 },
    { name: '🏙️ Lusaka Province', center: [-15.4167, 28.2833] as [number, number], zoom: 12 },
    { name: '⛏️ Copperbelt (Kitwe & Ndola)', center: [-12.8024, 28.2132] as [number, number], zoom: 11 },
    { name: '🌊 Livingstone & Vic Falls', center: [-17.8419, 25.8543] as [number, number], zoom: 13 },
    { name: '🌍 Global View', center: [0, 20] as [number, number], zoom: 3 }
];

interface Property {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    status: string;
    type?: string;
    sale_price?: number;
    province?: string;
    district?: string;
    llg?: string;
    images?: string[];
}

// Controller component to smoothly fly to target center & zoom
const MapViewController: React.FC<{ target: { center: [number, number], zoom: number } | null }> = ({ target }) => {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target.center, target.zoom, { duration: 1.5 });
        }
    }, [target, map]);
    return null;
};

// Map events tracker to update real-time coordinates HUD
const MapEventsHUD: React.FC<{
    onMouseMove: (coords: { lat: number, lng: number }) => void;
    onZoomChange: (zoom: number) => void;
}> = ({ onMouseMove, onZoomChange }) => {
    const map = useMapEvents({
        mousemove(e) {
            onMouseMove({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) });
        },
        zoomend() {
            onZoomChange(map.getZoom());
        }
    });
    return null;
};

const MapPage: React.FC = () => {
    const { settings } = useSettings();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = settings?.id || user.tenantId;

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Map GIS States
    const [activeBasemap, setActiveBasemap] = useState<string>('carto-voyager');
    const [flyTarget, setFlyTarget] = useState<{ center: [number, number], zoom: number } | null>(null);
    const [mouseCoords, setMouseCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [currentZoom, setCurrentZoom] = useState<number>(6);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Layer Controls
    const [layersVisible, setLayersVisible] = useState({
        properties: true,
        provinces: true,
        districts: true,
        settlements: true
    });
    const [showBasemapPanel, setShowBasemapPanel] = useState(false);
    const [showLayerPanel, setShowLayerPanel] = useState(false);

    // Default center targets Zambia
    const defaultCenter: [number, number] = [-13.1339, 27.8493];

    useEffect(() => {
        fetchProperties();
    }, [tenantId]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const tid = tenantId ? `?tenantId=${tenantId}&limit=200` : '?limit=200';
            const res = await fetch(`http://localhost:4000/api/properties${tid}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.properties || data.data || []);

            const validProps = list.filter((p: any) =>
                p.latitude && p.longitude &&
                !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude))
            );

            setProperties(validProps);

            // If we have properties, auto-center on their bounding centroid or target Zambia
            if (validProps.length > 0) {
                const avgLat = validProps.reduce((s: number, p: any) => s + Number(p.latitude), 0) / validProps.length;
                const avgLng = validProps.reduce((s: number, p: any) => s + Number(p.longitude), 0) / validProps.length;
                setFlyTarget({ center: [avgLat, avgLng], zoom: 8 });
            }
        } catch (error) {
            console.error('Error fetching properties for map:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price?: number) => {
        if (!price) return 'Contact Agent';
        const curr = settings?.config?.locale?.currency || 'ZMW';
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(price);
        } catch {
            return `${curr} ${price.toLocaleString()}`;
        }
    };

    // Filter properties based on search and drop-downs
    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            const matchesSearch = !searchQuery.trim() ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.province && p.province.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.district && p.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.llg && p.llg.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesType = typeFilter === 'ALL' || (p.type && p.type.toUpperCase() === typeFilter.toUpperCase());
            const matchesStatus = statusFilter === 'ALL' || (p.status && p.status.toUpperCase() === statusFilter.toUpperCase());

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [properties, searchQuery, typeFilter, statusFilter]);

    const activeBasemapObj = useMemo(() => {
        return BASEMAPS.find(b => b.id === activeBasemap) || BASEMAPS[0];
    }, [activeBasemap]);

    const handleJumpToProperty = (prop: Property) => {
        setFlyTarget({ center: [prop.latitude, prop.longitude], zoom: 15 });
    };

    const getStatusIcon = (status: string) => {
        switch ((status || '').toUpperCase()) {
            case 'AVAILABLE': return iconAvailable;
            case 'OCCUPIED': return iconOccupied;
            case 'MAINTENANCE': return iconMaintenance;
            default: return iconAvailable;
        }
    };

    return (
        <div className={`map-page ${isFullscreen ? 'fullscreen-mode' : ''}`}>
            {/* GIS Console Header Bar */}
            <div className="map-header">
                <div className="map-title-row">
                    <div className="map-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h1>Enterprise GIS Property Map</h1>
                            <span className="gis-badge">CARTO &bull; SPATIAL</span>
                        </div>
                        <p>
                            {filteredProperties.length} of {properties.length} properties plotted &bull; {settings?.name || 'Zambia Real Estate'} ({settings?.config?.country || 'Zambia'})
                        </p>
                    </div>
                </div>

                <div className="map-header-actions">
                    {/* Live Search */}
                    <div className="map-search-box">
                        <Search size={16} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search by property, province, district, compound..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        className="map-select-filter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="RESIDENTIAL">Residential</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="HOSPITALITY">Hospitality</option>
                        <option value="INDUSTRIAL">Industrial</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        className="map-select-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </select>

                    {/* Toggle Basemap Modal Button */}
                    <button
                        className="jump-btn"
                        style={{ background: showBasemapPanel ? '#4f46e5' : '#f8fafc', color: showBasemapPanel ? 'white' : '#1e293b' }}
                        onClick={() => setShowBasemapPanel(prev => !prev)}
                        title="Change Map Style"
                    >
                        <Layers size={15} /> Basemap: {activeBasemapObj.name}
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        className="jump-btn"
                        onClick={() => setIsFullscreen(prev => !prev)}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </div>

            {/* Map Canvas */}
            <div className="map-container">
                {/* Floating Quick Fly-To Locations */}
                <div className="floating-jump-panel">
                    <span className="jump-label">
                        <Compass size={14} color="#4f46e5" /> Quick Fly:
                    </span>
                    {QUICK_JUMP_PRESETS.map((p, idx) => (
                        <button
                            key={idx}
                            className="jump-btn"
                            onClick={() => setFlyTarget({ center: p.center, zoom: p.zoom })}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                {/* Floating Basemap Selector Panel */}
                {showBasemapPanel && (
                    <div className="floating-basemap-panel">
                        <div className="basemap-panel-header">
                            <span>Select Basemap Provider</span>
                            <span className="carto-badge">CARTO API ACTIVE</span>
                        </div>
                        <div className="basemap-chips-grid">
                            {BASEMAPS.map(bm => (
                                <button
                                    key={bm.id}
                                    className={`basemap-chip ${activeBasemap === bm.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveBasemap(bm.id);
                                        setShowBasemapPanel(false);
                                    }}
                                >
                                    <span style={{ fontSize: '1.1rem' }}>{bm.iconText}</span>
                                    <span>{bm.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leaflet MapContainer */}
                <MapContainer
                    center={defaultCenter}
                    zoom={6}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <MapViewController target={flyTarget} />
                    <MapEventsHUD
                        onMouseMove={(coords) => setMouseCoords(coords)}
                        onZoomChange={(zoom) => setCurrentZoom(zoom)}
                    />

                    {/* Primary Basemap TileLayer */}
                    <TileLayer
                        key={activeBasemapObj.id}
                        url={activeBasemapObj.url}
                        attribution={activeBasemapObj.attribution}
                        subdomains={activeBasemapObj.subdomains || ['a', 'b', 'c', 'd']}
                        maxZoom={19}
                    />

                    {/* Optional Satellite Labels Overlay */}
                    {activeBasemapObj.labelsUrl && (
                        <TileLayer
                            key={`${activeBasemapObj.id}-labels`}
                            url={activeBasemapObj.labelsUrl}
                            attribution=""
                            subdomains={activeBasemapObj.subdomains || ['a', 'b', 'c', 'd']}
                            maxZoom={19}
                        />
                    )}

                    {/* Render Properties as Markers */}
                    {layersVisible.properties && filteredProperties.map(property => (
                        <Marker
                            key={property.id}
                            position={[property.latitude, property.longitude]}
                            icon={getStatusIcon(property.status)}
                        >
                            <Popup className="custom-property-popup">
                                <div className="property-popup">
                                    {property.images && property.images.length > 0 ? (
                                        <img src={property.images[0]} alt={property.name} />
                                    ) : (
                                        <div style={{ height: '90px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: '#94a3b8' }}>
                                            <Building2 size={32} />
                                        </div>
                                    )}
                                    <h3>{property.name}</h3>
                                    <p>
                                        <MapPin size={13} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                        {property.address || `${property.district || ''}, ${property.province || 'Zambia'}`}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                        <div className="price-tag">
                                            {formatPrice(property.sale_price)}
                                        </div>
                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: '700',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: property.status === 'AVAILABLE' ? '#dcfce7' : '#e0e7ff',
                                            color: property.status === 'AVAILABLE' ? '#166534' : '#3730a3'
                                        }}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                        GPS: {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                                    </div>
                                    <button
                                        className="popup-details-btn"
                                        onClick={() => handleJumpToProperty(property)}
                                    >
                                        Focus Landmark
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Floating Bottom HUD Bar (Coordinates & Zoom) */}
                <div className="map-hud-bar">
                    <div className="hud-item">
                        <Crosshair size={13} color="#38bdf8" />
                        <span>Lat: {mouseCoords ? mouseCoords.lat : '-13.1339'}, Lng: {mouseCoords ? mouseCoords.lng : '27.8493'}</span>
                    </div>
                    <div className="hud-item">
                        <span>Zoom: {currentZoom}x</span>
                    </div>
                    <div className="hud-item">
                        <span>Basemap: {activeBasemapObj.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
