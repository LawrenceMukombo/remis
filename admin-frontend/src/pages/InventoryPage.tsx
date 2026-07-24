import React, { useState, useEffect } from 'react';
import { Plus, Package, Search, Filter, MoreHorizontal, ArrowUpRight, ArrowDownLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './InventoryPage.css';

interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    minQuantity: number;
    unitPrice: string;
    location: string;
    status: string;
}

const InventoryPage: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    const [newItem, setNewItem] = useState({
        name: '',
        sku: '',
        category: 'MAINTENANCE',
        quantity: 0,
        minQuantity: 5,
        unitPrice: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/inventory?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditMode(true);
        setSelectedId(item.id);
        setNewItem({
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            minQuantity: item.minQuantity,
            unitPrice: item.unitPrice,
            location: item.location,
            description: item.description
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setNewItem({ name: '', sku: '', category: 'MAINTENANCE', quantity: 0, minQuantity: 5, unitPrice: '', location: '', description: '' });
        setEditMode(false);
        setSelectedId(null);
        setShowAddModal(false);
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editMode && selectedId
                ? `http://localhost:4000/api/inventory/${selectedId}`
                : 'http://localhost:4000/api/inventory';

            const method = editMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newItem, tenantId })
            });
            if (res.ok) {
                showToast(editMode ? 'Item updated successfully' : 'Item added to inventory', 'success');
                resetForm();
                fetchInventory();
            }
        } catch (error) {
            showToast('Failed to save item', 'error');
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="inventory-page">
            <div className="inventory-header">
                <div className="header-text">
                    <h1>Inventory & Assets</h1>
                    <p>Track supplies, equipment, and property assets.</p>
                </div>
                <button className="add-btn" onClick={() => {
                    setEditMode(false);
                    setNewItem({ name: '', sku: '', category: 'MAINTENANCE', quantity: 0, minQuantity: 5, unitPrice: '', location: '', description: '' });
                    setShowAddModal(true);
                }}>
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            <div className="inventory-tools">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search items, SKUs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <button className="tool-btn"><Filter size={18} /> Filters</button>
                    <select className="category-select" title="Category Filter">
                        <option>All Categories</option>
                        <option>Maintenance</option>
                        <option>Cleaning</option>
                        <option>Office</option>
                    </select>
                </div>
            </div>

            <div className="inventory-grid">
                {loading ? (
                    <div className="loading-state">Loading stock records...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>No items found</h3>
                        <p>Start tracking your assets by adding your first inventory item.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div
                            key={item.id}
                            className={`inventory-card ${item.status.toLowerCase()}`}
                            onClick={() => handleEditItem(item)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-header">
                                <span className={`status-tag ${item.status.toLowerCase()}`}>
                                    {item.status.replace('_', ' ')}
                                </span>
                                <button className="more-btn" title="Options" onClick={(e) => { e.stopPropagation(); }}><MoreHorizontal size={18} /></button>
                            </div>
                            <div className="card-body">
                                <div className="item-icon">
                                    <Package size={24} />
                                </div>
                                <h3 className="item-name">{item.name}</h3>
                                <p className="item-sku">{item.sku || 'No SKU'}</p>

                                <div className="stock-level">
                                    <div className="level-info">
                                        <span className="qty">{item.quantity}</span>
                                        <span className="unit">units</span>
                                    </div>
                                    <div className="level-bar">
                                        <div
                                            className="fill"
                                            style={{ width: `${Math.min((item.quantity / (item.minQuantity * 2)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="location">
                                    <span className="label">Location</span>
                                    <span className="value">{item.location || 'Not set'}</span>
                                </div>
                                <div className="actions">
                                    <button className="stock-btn in" title="Stock In" onClick={(e) => { e.stopPropagation(); /* TODO: Implement Stock In */ }}><ArrowUpRight size={16} /></button>
                                    <button className="stock-btn out" title="Stock Out" onClick={(e) => { e.stopPropagation(); /* TODO: Implement Stock Out */ }}><ArrowDownLeft size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="inventory-modal">
                        <div className="modal-header">
                            <h2>{editMode ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
                            <button className="close-btn" onClick={resetForm} title="Close"><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <form onSubmit={handleSaveItem} className="inventory-form">
                            <div className="form-group full">
                                <label htmlFor="item-name">Item Name</label>
                                <input
                                    id="item-name"
                                    required
                                    type="text"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g. LED Light Bulbs (10W)"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="item-sku">SKU / Reference</label>
                                    <input
                                        id="item-sku"
                                        type="text"
                                        value={newItem.sku}
                                        onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                                        placeholder="INV-001"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="item-category">Category</label>
                                    <select
                                        id="item-category"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        title="Category"
                                    >
                                        <option value="MAINTENANCE">Maintenance</option>
                                        <option value="OFFICE">Office</option>
                                        <option value="CLEANING">Cleaning</option>
                                        <option value="FURNITURE">Furniture</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantity {editMode && <span style={{ fontSize: '0.7em', color: '#64748b' }}>(Use Stock In/Out to change)</span>}</label>
                                    <input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} disabled={editMode} />
                                </div>
                                <div className="form-group">
                                    <label>Min. Threshold</label>
                                    <input type="number" value={newItem.minQuantity} onChange={e => setNewItem({ ...newItem, minQuantity: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Unit Price ($)</label>
                                    <input type="number" step="0.01" value={newItem.unitPrice} onChange={e => setNewItem({ ...newItem, unitPrice: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Storage Location</label>
                                    <input type="text" value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} placeholder="Shelf A1" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="primary-btn">{editMode ? 'Update Item' : 'Save Item'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
