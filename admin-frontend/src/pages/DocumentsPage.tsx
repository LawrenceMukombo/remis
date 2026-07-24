import React, { useState, useEffect } from 'react';
import { FileText, Image, Upload, File, Trash2, Download, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './DocumentsPage.css';

interface Document {
    id: string;
    name: string;
    url: string;
    type: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

const DocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [docName, setDocName] = useState('');
    const [docType, setDocType] = useState('OTHER');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/documents?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setDocuments(data);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Auto-fill name if empty
            if (!docName) {
                setDocName(e.target.files[0].name);
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadRes = await fetch('http://localhost:4000/api/upload/file', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('File upload failed');

            const uploadData = await uploadRes.json();
            const { url, mimetype, size } = uploadData;

            // 2. Create Document Record
            const docRes = await fetch('http://localhost:4000/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: docName,
                    url,
                    type: docType,
                    mimeType: mimetype,
                    size,
                    tenantId
                })
            });

            if (!docRes.ok) throw new Error('Failed to create document record');

            showToast('Document uploaded successfully', 'success');
            setShowModal(false);
            setSelectedFile(null);
            setDocName('');
            setDocType('OTHER');
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            showToast('Failed to upload document', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/documents/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Document deleted', 'success');
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const getIcon = (mimeType: string) => {
        if (mimeType?.includes('image')) return <Image className="document-icon" />;
        if (mimeType?.includes('pdf')) return <FileText className="document-icon" />;
        return <File className="document-icon" />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="documents-page">
            <div className="documents-header">
                <div className="documents-title">
                    <h1>Document Management</h1>
                    <p>Store and organize property documents, leases, and contracts.</p>
                </div>
                <div className="documents-actions">
                    <button className="upload-btn" onClick={() => setShowModal(true)}>
                        <Upload size={18} />
                        Upload Document
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '500px', maxWidth: '90vw',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            Upload Document
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </h2>
                        <form onSubmit={handleUpload}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Select File</label>
                                <input
                                    required
                                    type="file"
                                    onChange={handleFileSelect}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Document Name</label>
                                <input
                                    required
                                    type="text"
                                    value={docName}
                                    onChange={(e) => setDocName(e.target.value)}
                                    placeholder="e.g. Lease Agreement - Unit 101"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Document Type</label>
                                <select
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white' }}
                                >
                                    <option value="LEASE">Lease Agreement</option>
                                    <option value="CONTRACT">Contract</option>
                                    <option value="INVOICE">Invoice</option>
                                    <option value="RECEIPT">Receipt</option>
                                    <option value="ID">Identification</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="documents-grid">
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading documents...</div>
                ) : documents.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No documents found</h3>
                        <p>Upload files to get started.</p>
                    </div>
                ) : (
                    documents.map(doc => (
                        <div key={doc.id} className="document-card">
                            {getIcon(doc.mimeType)}
                            <div className="document-name" title={doc.name}>{doc.name}</div>
                            <div className="document-meta">
                                {formatSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}
                            </div>
                            <div className="document-actions">
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="action-btn" title="Download/View">
                                    <Download size={16} />
                                </a>
                                <button onClick={() => handleDelete(doc.id)} className="action-btn delete" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DocumentsPage;
