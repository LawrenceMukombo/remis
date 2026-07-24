import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Smartphone, MapPin, Plus, Camera } from 'lucide-react';

interface PropertyForm {
    id: string;
    propertyName: string;
    type: string;
    status: string;
    address: string;
    description: string;
    gps: { lat: number, lng: number } | null;
    images: string[];
    synced: boolean;
    timestamp: number;
}

const FieldDashboard: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    // Data Collection State
    const [forms, setForms] = useState<PropertyForm[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form Inputs
    const [newForm, setNewForm] = useState<{
        propertyName: string;
        type: string;
        status: string;
        address: string;
        description: string;
        gps: { lat: number, lng: number } | null;
        images: string[];
    }>({
        propertyName: '',
        type: 'RESIDENTIAL',
        status: 'AVAILABLE',
        address: '',
        description: '',
        gps: null,
        images: []
    });

    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 1. Ensure Device ID exists
        let deviceId = localStorage.getItem('field_deviceId');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('field_deviceId', deviceId);
        }

        // 2. Register/Heartbeat
        const register = async () => {
            try {
                // Get user info if authenticated
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';

                await fetch(`${API_BASE}/field/devices`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deviceId,
                        platform: 'PWA',
                        appVersion: '1.2.0',
                        tenantId: user.tenantId, // might be undefined, backend now handles default
                        assignedTo: user.id
                    })
                });
            } catch (e) {
                console.error("Heartbeat failed", e);
            }
        };
        register();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
            };
            reader.readAsDataURL(file);
        }
    };

    const captureGPS = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setNewForm(prev => ({
                    ...prev,
                    gps: { lat: position.coords.latitude, lng: position.coords.longitude }
                }));
                setIsLocating(false);
            }, (error) => {
                console.error(error);
                alert("Could not get location. Ensure permissions are granted.");
                setIsLocating(false);
            });
        } else {
            alert("GPS not available");
            setIsLocating(false);
        }
    };

    const handleSaveForm = () => {
        if (!newForm.propertyName) return alert("Property Name is required");

        const submission: PropertyForm = {
            id: Date.now().toString(),
            ...newForm,
            synced: false,
            timestamp: Date.now()
        };

        setForms(prev => [...prev, submission]);
        setNewForm({
            propertyName: '',
            type: 'RESIDENTIAL',
            status: 'AVAILABLE',
            address: '',
            description: '',
            gps: null,
            images: []
        });
        setShowForm(false);
    };

    const handleSync = async () => {
        if (!isOnline) {
            alert("Device is offline. Changes are saved locally and will sync when connection is restored.");
            return;
        }

        const unsyncedForms = forms.filter(f => !f.synced);
        const deviceId = localStorage.getItem('field_deviceId');

        try {
            // 3. Sync to Backend
            const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';
            const res = await fetch(`${API_BASE}/field/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    localChanges: unsyncedForms,
                    deviceId
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Server error');
            }

            const data = await res.json();

            // Mark as synced locally
            setForms(prev => prev.map(f => ({ ...f, synced: true })));
            setLastSync(new Date());
            alert(`Synced ${data.processed || 0} items successfully!`);

        } catch (e: any) {
            console.error("Sync failed", e);
            alert("Sync failed: " + e.message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Field Ops</h1>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: isOnline ? '#ecfdf5' : '#fef2f2',
                    padding: '6px 12px', borderRadius: '20px',
                    color: isOnline ? '#059669' : '#dc2626',
                    fontWeight: 600, fontSize: '0.875rem'
                }}>
                    {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                    {isOnline ? 'Online' : 'Offline'}
                </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '0.875rem' }}>Last Synced</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{lastSync ? lastSync.toLocaleTimeString() : 'Not yet synced'}</p>
                    </div>
                    <button
                        onClick={handleSync}
                        style={{
                            background: '#2563eb', color: 'white', border: 'none',
                            padding: '10px 16px', borderRadius: '8px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <RefreshCw size={18} />
                        Sync Now
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        background: '#f3f4f6', border: '1px solid #d1d5db', padding: '15px',
                        borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        cursor: 'pointer'
                    }}>
                    <Plus size={24} style={{ marginBottom: '5px', color: '#4b5563' }} />
                    <span style={{ fontWeight: 600, color: '#374151' }}>Collect Property</span>
                </button>
                <button
                    onClick={() => alert("Not implemented yet")}
                    style={{
                        background: '#f3f4f6', border: '1px solid #d1d5db', padding: '15px',
                        borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        cursor: 'pointer'
                    }}>
                    <Smartphone size={24} style={{ marginBottom: '5px', color: '#4b5563' }} />
                    <span style={{ fontWeight: 600, color: '#374151' }}>Scan Barcode</span>
                </button>
            </div>

            {showForm && (
                <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ marginTop: 0 }}>New Property Receipt</h3>

                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text" placeholder="Property Name *"
                            value={newForm.propertyName}
                            onChange={e => setNewForm({ ...newForm, propertyName: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <select
                            value={newForm.type}
                            onChange={e => setNewForm({ ...newForm, type: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                        >
                            <option value="RESIDENTIAL">Residential</option>
                            <option value="COMMERCIAL">Commercial</option>
                            <option value="INDUSTRIAL">Industrial</option>
                            <option value="LAND">Land</option>
                        </select>

                        <select
                            value={newForm.status}
                            onChange={e => setNewForm({ ...newForm, status: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="LEASED">Leased</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="SOLD">Sold</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text" placeholder="Address"
                            value={newForm.address}
                            onChange={e => setNewForm({ ...newForm, address: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <textarea
                            placeholder="Description / Notes"
                            value={newForm.description}
                            onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                            rows={3}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Photos</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                            {newForm.images.map((img, idx) => (
                                <img key={idx} src={img} alt="captured" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            ))}
                            <label style={{
                                width: '60px', height: '60px', border: '1px dashed #d1d5db', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'white'
                            }}>
                                <Camera size={20} color="#6b7280" />
                                <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <button
                            onClick={captureGPS}
                            style={{
                                background: 'white', border: '1px solid #d1d5db', padding: '8px 12px',
                                borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'
                            }}>
                            <MapPin size={16} />
                            {isLocating ? 'Locating...' : (newForm.gps ? 'Update GPS' : 'Capture GPS')}
                        </button>
                        {newForm.gps && <span style={{ fontSize: '0.8rem', color: '#059669' }}>✓ {newForm.gps.lat.toFixed(4)}, {newForm.gps.lng.toFixed(4)}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSaveForm} style={{ flex: 1, background: '#059669', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Save Locally</button>
                        <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', color: '#6b7280', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Local Data Queue */}
            {forms.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Pending Uploads ({forms.filter(f => !f.synced).length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {forms.slice().reverse().map(form => (
                            <div key={form.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{form.propertyName}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                                        {form.type} • {form.status}
                                    </p>
                                </div>
                                {form.synced ? <CheckCircle size={20} className="text-green-500" /> : <RefreshCw size={20} className="text-gray-400" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
                <Smartphone size={16} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px auto' }} />
                v1.2.0 (PWA)
            </div>
        </div>
    );
};

export default FieldDashboard;
