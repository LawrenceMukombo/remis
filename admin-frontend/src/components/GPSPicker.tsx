import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Edit3 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GPSPickerProps {
    latitude: string;
    longitude: string;
    onLocationChange?: (lat: string, lng: string) => void;
    primaryColor?: string;
    readOnly?: boolean;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition, readOnly }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void, readOnly?: boolean }) {
    useMapEvents({
        click(e) {
            if (!readOnly) {
                setPosition([e.latlng.lat, e.latlng.lng]);
            }
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

const GPSPicker: React.FC<GPSPickerProps> = ({ latitude, longitude, onLocationChange, primaryColor = '#667eea', readOnly = false }) => {
    const [manualMode, setManualMode] = useState(false);
    const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    // Initialize map position from props
    useEffect(() => {
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapPosition([lat, lng]);
            }
        } else {
            // Default to Lusaka, Zambia if no coordinates
            setMapPosition([-15.4167, 28.2833]);
        }
    }, [latitude, longitude]);

    // Update parent when map position changes
    useEffect(() => {
        if (mapPosition && onLocationChange && !readOnly) {
            onLocationChange(mapPosition[0].toFixed(6), mapPosition[1].toFixed(6));
        }
    }, [mapPosition, onLocationChange, readOnly]);

    const getCurrentLocation = () => {
        if (readOnly) return;
        setGettingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos: [number, number] = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    setMapPosition(newPos);
                    if (onLocationChange) {
                        onLocationChange(newPos[0].toFixed(6), newPos[1].toFixed(6));
                    }
                    setGettingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    let errorMsg = "Could not get your current location.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMsg += " Please enable location permissions in your browser.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMsg += " Location information is unavailable. Make sure GPS is enabled on your device.";
                    } else if (error.code === error.TIMEOUT) {
                        errorMsg += " Location request timed out. This can happen indoors or in areas with poor GPS signal. Try moving near a window or outdoors.";
                    }
                    alert(errorMsg);
                    setGettingLocation(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 30000, // Increased to 30 seconds for better results
                    maximumAge: 0
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setGettingLocation(false);
        }
    };

    const handleManualInput = (lat: string, lng: string) => {
        if (readOnly) return;
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            setMapPosition([parsedLat, parsedLng]);
        }
        if (onLocationChange) {
            onLocationChange(lat, lng);
        }
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            {/* GPS Actions - Hide in readOnly mode */}
            {!readOnly && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        style={{
                            flex: 1,
                            minWidth: '140px',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: primaryColor,
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: gettingLocation ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            opacity: gettingLocation ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => !gettingLocation && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                    >
                        <Navigation size={16} />
                        {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setManualMode(!manualMode)}
                        style={{
                            flex: 1,
                            minWidth: '140px',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: manualMode ? primaryColor : 'white',
                            color: manualMode ? 'white' : '#64748b',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!manualMode) {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#475569';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!manualMode) {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = '#64748b';
                            }
                        }}
                    >
                        <Edit3 size={16} />
                        Manual Entry
                    </button>
                </div>
            )}

            {/* Manual Input Fields */}
            {manualMode && !readOnly && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                            📍 Latitude
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={latitude}
                            onChange={(e) => handleManualInput(e.target.value, longitude)}
                            placeholder="-9.443333"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9375rem',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                            📍 Longitude
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={longitude}
                            onChange={(e) => handleManualInput(latitude, e.target.value)}
                            placeholder="147.180278"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9375rem',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Interactive Map */}
            <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
                <div style={{
                    backgroundColor: primaryColor,
                    color: 'white',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <MapPin size={16} />
                    {readOnly ? 'Location Details' : 'Click on map to drop a pin or drag the marker'}
                </div>
                <div style={{ height: '280px', boxSizing: 'border-box' }}>
                    {mapPosition && (
                        <MapContainer
                            center={mapPosition}
                            zoom={13}
                            style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
                            key={mapPosition.join(',')} // Force re-render when position changes
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_2wxx_1_19a2e48a7de2e23331436131"
                                subdomains={['a', 'b', 'c', 'd']}
                            />
                            <LocationMarker position={mapPosition} setPosition={setMapPosition} readOnly={readOnly} />
                        </MapContainer>
                    )}
                </div>
            </div>

            {/* Current Coordinates Display */}
            {(latitude && longitude && !readOnly) && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Selected Coordinates:
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9375rem', color: '#0f172a', fontWeight: '600' }}>
                        {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GPSPicker;
