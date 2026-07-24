import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import './MapPage.css';
import L from 'leaflet';

// Fix Marker icon issue in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Property {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    status: string;
    sale_price?: number;
    images: string[];
}

const MapPage: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    // Default center (Port Moresby, PNG)
    const defaultCenter: [number, number] = [-9.4438, 147.1803];

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/properties?tenantId=${tenantId}&limit=100`);
            const data = await res.json();
            if (data.properties) {
                // Filter properties with valid coordinates
                const validProperties = data.properties.filter((p: any) =>
                    p.latitude && p.longitude &&
                    !isNaN(p.latitude) && !isNaN(p.longitude)
                );
                setProperties(validProperties);
            }
        } catch (error) {
            console.error('Error fetching properties for map:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price?: number) => {
        if (!price) return 'N/A';
        return new Intl.NumberFormat('en-PG', { style: 'currency', currency: 'PGK' }).format(price);
    };

    if (loading) return <div>Loading Map...</div>;

    return (
        <div className="map-page">
            <div className="map-header">
                <div className="map-title">
                    <h1>Property Map</h1>
                    <p>{properties.length} properties located</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Filters could go here */}
                </div>
            </div>

            <div className="map-container">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {properties.map(property => (
                        <Marker
                            key={property.id}
                            position={[property.latitude, property.longitude]}
                        >
                            <Popup>
                                <div className="property-popup">
                                    {property.images && property.images.length > 0 && (
                                        <img src={property.images[0]} alt={property.name} />
                                    )}
                                    <h3>{property.name}</h3>
                                    <p><MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />{property.address}</p>
                                    <div className="price-tag">
                                        {formatPrice(property.sale_price)}
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: property.status === 'AVAILABLE' ? '#059669' : '#dc2626'
                                        }}>
                                            {property.status}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
