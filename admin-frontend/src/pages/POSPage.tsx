import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Search, Package, Command, CreditCard, Banknote, Landmark } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../context/SettingsContext';
import './POSPage.css';

interface Product {
    id: string;
    name: string;
    description: string;
    unitPrice: number;
    quantity: number; // Stock available
    inventoryItemId?: string; // If linked to inventory
}

interface CartItem extends Product {
    cartQuantity: number;
}

const POSPage: React.FC = () => {
    const { settings } = useSettings();
    const currencyCode = settings?.config.locale.currency || 'USD';

    const getCurrencySymbol = (code: string) => {
        switch (code) {
            case 'USD': return '$';
            case 'PGK': return 'K';
            case 'AUD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            default: return code;
        }
    };

    const currencySymbol = getCurrencySymbol(currencyCode);

    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // We reuse inventory items as products for now
            const res = await fetch(`http://localhost:4000/api/inventory?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Filter only items with price > 0 and stock > 0
                const saleableItems = data
                    .filter((item: any) => Number(item.unitPrice) > 0 && item.status !== 'OUT_OF_STOCK')
                    .map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        unitPrice: Number(item.unitPrice),
                        quantity: Number(item.quantity),
                        inventoryItemId: item.id
                    }));
                setProducts(saleableItems);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.cartQuantity >= product.quantity) {
                showToast('Insufficient stock', 'error');
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, cartQuantity: 1 }]);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.cartQuantity + delta;
                if (newQty > item.quantity) {
                    showToast('Max stock reached', 'error');
                    return item;
                }
                return newQty > 0 ? { ...item, cartQuantity: newQty } : item;
            }
            return item;
        }));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.unitPrice * item.cartQuantity), 0);
    };

    const handleCheckout = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/pos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        inventoryItemId: item.inventoryItemId,
                        name: item.name,
                        quantity: item.cartQuantity,
                        unitPrice: item.unitPrice
                    })),
                    paymentMethod,
                    customerName: 'Walk-in Customer', // Could add input for this
                    tenantId,
                    performedBy: user.id
                })
            });

            if (res.ok) {
                showToast('Transaction Completed', 'success');
                setCart([]);
                setShowCheckout(false);
                fetchProducts(); // Refresh stock
            } else {
                throw new Error('Checkout failed');
            }
        } catch (error) {
            console.error('Checkout Error:', error);
            showToast('Transaction failed', 'error');
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="pos-page">
            <div className="pos-layout">
                {/* Left Panel: Product Grid */}
                <div className="pos-products-panel">
                    <div className="pos-header">
                        <div>
                            <h1>Point of Sale</h1>
                            <p>Process sales and manage checkout.</p>
                        </div>
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="products-grid">
                        {loading ? (
                            <div>Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="empty-products">
                                <Package size={48} />
                                <p>No saleable items found in inventory.</p>
                            </div>
                        ) : (
                            filteredProducts.map(product => (
                                <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                                    <div className="product-icon">
                                        <Package size={24} />
                                    </div>
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <div className="product-meta">
                                            <span className="price">{currencySymbol}{product.unitPrice.toFixed(2)}</span>
                                            <span className="stock">Stock: {product.quantity}</span>
                                        </div>
                                    </div>
                                    <button className="add-btn-mini" title="Add to Cart" aria-label="Add to Cart">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Cart */}
                <div className="pos-sidebar">
                    <div className="cart-header">
                        <h2>Current Order</h2>
                        <span className="item-count">{cart.reduce((a, b) => a + b.cartQuantity, 0)} Items</span>
                    </div>

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <ShoppingCart size={48} />
                                <p>Cart is empty</p>
                                <span>Select items to add to order</span>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-info">
                                        <h4>{item.name}</h4>
                                        <span className="unit-price">{currencySymbol}{item.unitPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="cart-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease Quantity"><Minus size={14} /></button>
                                        <span>{item.cartQuantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase Quantity"><Plus size={14} /></button>
                                    </div>
                                    <div className="cart-item-total">
                                        {currencySymbol}{(item.unitPrice * item.cartQuantity).toFixed(2)}
                                    </div>
                                    <button className="remove-item-btn" onClick={() => removeFromCart(item.id)} aria-label="Remove Item">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="cart-footer">
                        <div className="totals">
                            <div className="row">
                                <span>Subtotal</span>
                                <span>{currencySymbol}{calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span>Tax (0%)</span>
                                <span>{currencySymbol}0.00</span>
                            </div>
                            <div className="row total">
                                <span>Total</span>
                                <span>{currencySymbol}{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            className="checkout-btn"
                            disabled={cart.length === 0}
                            onClick={() => setShowCheckout(true)}
                        >
                            Checkout Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="modal-overlay">
                    <div className="checkout-modal">
                        <div className="modal-header">
                            <h2>Complete Payment</h2>
                            <button className="close-btn" onClick={() => setShowCheckout(false)} title="Close"><Command size={20} /></button>
                        </div>

                        <div className="amount-display">
                            <span>Total Due</span>
                            <h1>{currencySymbol}{calculateTotal().toFixed(2)}</h1>
                        </div>

                        <div className="payment-methods">
                            <h3>Select Payment Method</h3>
                            <div className="methods-grid">
                                <button
                                    className={`method-card ${paymentMethod === 'CASH' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('CASH')}
                                >
                                    <Banknote size={24} />
                                    <span>Cash</span>
                                </button>
                                <button
                                    className={`method-card ${paymentMethod === 'CARD' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('CARD')}
                                >
                                    <CreditCard size={24} />
                                    <span>Card</span>
                                </button>
                                <button
                                    className={`method-card ${paymentMethod === 'TRANSFER' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('TRANSFER')}
                                >
                                    <Landmark size={24} />
                                    <span>Transfer</span>
                                </button>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowCheckout(false)}>Cancel</button>
                            <button className="pay-btn" onClick={handleCheckout}>
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSPage;
