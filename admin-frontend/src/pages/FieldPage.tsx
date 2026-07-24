import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, Ban, CheckCircle } from 'lucide-react';
import './FieldPage.css';

interface Device {
    id: string;
    deviceId: string;
    name: string;
    appVersion: string;
    platform: string;
    status: string;
    lastSyncAt: string;
    user?: { full_name: string };
    assignedTo?: string;
}

const FieldPage: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/field/devices?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setDevices(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBlock = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
            const res = await fetch(`http://localhost:4000/api/field/devices/${id}/block`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchDevices();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="field-page">
            <div className="field-header">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Field App Management</h1>
                <p style={{ color: '#6b7280' }}>Monitor registered mobile devices and sync status.</p>
            </div>

            <div className="devices-list">
                {devices.map(device => (
                    <div key={device.id} className="device-card">
                        <div className={`device-status status-${device.status}`}>
                            {device.status}
                        </div>
                        <div className="device-icon">
                            <Smartphone size={24} />
                        </div>
                        <div className="device-info">
                            <h3>{device.user?.full_name || 'Unassigned'}</h3>
                            <div className="device-meta">
                                <div>ID: {device.deviceId.substring(0, 8)}...</div>
                                <div>Ver: {device.appVersion || 'Unknown'} ({device.platform || 'N/A'})</div>
                                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <RefreshCw size={12} />
                                    Last Sync: {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : 'Never'}
                                </div>
                            </div>
                        </div>
                        <div className="device-actions">
                            <button
                                className={`action-btn-sm ${device.status === 'ACTIVE' ? 'btn-block' : 'btn-unblock'}`}
                                onClick={() => handleBlock(device.id, device.status)}
                            >
                                {device.status === 'ACTIVE' ? <><Ban size={14} style={{ marginRight: 4 }} /> Block Access</> : <><CheckCircle size={14} style={{ marginRight: 4 }} /> Unblock</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {devices.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f9fafb', borderRadius: 12 }}>
                    <Smartphone size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p style={{ color: '#6b7280' }}>No devices registered yet.</p>
                    <p style={{ fontSize: '0.875rem' }}>Staff members can download the app and log in to register their device.</p>
                </div>
            )}
        </div>
    );
};

export default FieldPage;
