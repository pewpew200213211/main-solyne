import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { orderService } from '@/lib/orderService';
import {
    Plus, Edit2, Trash2, LogOut, Package, Tag, TrendingUp,
    ShoppingBag, Clock, DollarSign, MessageSquare, X, Check,
    ChevronDown, UploadCloud, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── helpers ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Shirts', 'Drop Shoulder Tees', 'Vaggy Pants', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];

const STATUS_STYLES = {
    pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    packing:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shipping:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const emptyForm = {
    name: '',
    price: '',
    discount_price: '',
    stock: '10',
    category: CATEGORIES[0],
    is_on_sale: false,
    sizes: [],
    images: [],
    description: '',
};

// ─── component ───────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]); // local preview for file input
    const [editingProductId, setEditingProductId] = useState(null);
    const [previewProduct, setPreviewProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [editingDelivery, setEditingDelivery] = useState(null); // { id, value }
    const [editingNotes, setEditingNotes] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setIsLoading(true);
        await Promise.all([fetchProducts(), fetchOrders()]);
        setIsLoading(false);
    }

    async function fetchProducts() {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data) setProducts(data);
    }

    async function fetchOrders() {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data || []);
        } catch (e) {
            console.error('Orders fetch failed:', e);
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const openAdd = () => {
        setEditingProductId(null);
        setFormData(emptyForm);
        setImageFiles([]);
        setPreviewImages([]);
        setIsModalOpen(true);
    };

    const openEdit = (p) => {
        setEditingProductId(p.id);
        setFormData({
            name: p.name || '',
            price: String(p.price || ''),
            discount_price: String(p.discount_price || ''),
            stock: String(p.stock || '10'),
            category: p.category || CATEGORIES[0],
            is_on_sale: p.is_on_sale || false,
            sizes: p.sizes || [],
            images: p.images || [],
            description: p.description || '',
        });
        setImageFiles([]);
        setPreviewImages([]);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        let imageUrls = [...(formData.images || [])];

        // Upload new files
        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                const ext = file.name.split('.').pop();
                const fileName = `product-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${ext}`;
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
                if (uploadError) {
                    alert('Image upload failed: ' + uploadError.message);
                    continue;
                }
                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                imageUrls.push(publicUrl);
            }
        }

        const payload = {
            name: formData.name,
            price: parseFloat(formData.price) || 0,
            discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
            stock: parseInt(formData.stock) || 0,
            category: formData.category,
            is_on_sale: formData.is_on_sale,
            sizes: formData.sizes,
            description: formData.description,
            ...(imageUrls.length > 0 ? { images: imageUrls } : { images: [] }),
        };

        let result;
        if (editingProductId) {
            result = await supabase.from('products').update(payload).eq('id', editingProductId).select();
        } else {
            result = await supabase.from('products').insert([payload]).select();
        }

        const { data, error } = result;
        if (error) {
            alert('Save failed: ' + error.message);
        } else if (data?.[0]) {
            if (editingProductId) {
                setProducts(prev => prev.map(p => p.id === editingProductId ? data[0] : p));
            } else {
                setProducts(prev => [data[0], ...prev]);
            }
        }

        setIsUploading(false);
        setIsModalOpen(false);
        setImageFiles([]);
        setPreviewImages([]);
    };

    const handleOrderStatus = async (orderId, status, deliveryInfo, adminNotes) => {
        try {
            await orderService.updateOrderStatus(orderId, status, deliveryInfo, adminNotes);
            await fetchOrders();
        } catch {
            alert('Failed to update order.');
        }
    };

    const toggleSize = (size) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
        }));
    };

    // Computed stats
    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = activeOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Top Nav */}
            <nav className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <span className="font-serif text-lg tracking-wider">SOL<span className="text-primary">Y</span>NÉ Admin</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/shop" className="text-xs uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">View Store</Link>
                    <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs */}
                <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-8 w-fit">
                    {[
                        { id: 'products', label: 'Inventory', icon: Tag },
                        { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingCount },
                        { id: 'sales', label: 'Sales', icon: TrendingUp },
                    ].map(({ id, label, icon: Icon, badge }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-medium transition-all duration-200
                                ${activeTab === id ? 'bg-shadow-layer text-primary' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                            {badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>}
                        </button>
                    ))}
                </div>

                {/* ── PRODUCTS TAB ── */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-serif font-light">Inventory</h2>
                                <p className="text-sm text-foreground/40 mt-1">Manage your complete product catalog.</p>
                            </div>
                            <button type="button" onClick={openAdd}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-[#c9a87b] transition-colors">
                                <Plus className="w-4 h-4" /> Add Product
                            </button>
                        </div>

                        <div className="bg-card border border-border rounded-xl overflow-hidden">
                            {isLoading ? (
                                <div className="py-16 text-center text-foreground/30 animate-pulse">Loading products…</div>
                            ) : products.length === 0 ? (
                                <div className="py-16 text-center text-foreground/30">No products yet. Add your first one!</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-background">
                                                {['Product', 'Category', 'Sizes', 'Price (BDT)', 'Stock', 'Status', ''].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-foreground/30 font-medium">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors group">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-12 bg-shadow-layer rounded-md overflow-hidden flex-shrink-0">
                                                                {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                                                {product.description && <p className="text-xs text-foreground/30 truncate max-w-[200px]">{product.description}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-white/5 text-foreground/60 rounded-full">{product.category}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.sizes?.length > 0 ? product.sizes.map(s => (
                                                                <span key={s} className="px-1.5 py-0.5 text-[9px] font-bold bg-white/5 text-foreground/40 border border-border rounded">
                                                                    {s}
                                                                </span>
                                                            )) : <span className="text-[10px] text-foreground/20 italic">–</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm">
                                                        {product.discount_price ? (
                                                            <span className="flex flex-col">
                                                                <span className="line-through text-foreground/30 text-xs">৳{product.price}</span>
                                                                <span className="text-primary font-bold">৳{product.discount_price}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="font-bold text-foreground">৳{product.price}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-foreground/60">
                                                        <span className={product.stock <= 5 ? 'text-red-400' : ''}>{product.stock} units</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {product.is_on_sale ? (
                                                            <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full bg-primary/15 text-primary border border-[#b8976a]/20">On Sale</span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button type="button" onClick={() => setPreviewProduct(product)} className="p-2 hover:bg-muted/70 rounded-lg text-foreground/40 hover:text-foreground transition-colors">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button type="button" onClick={() => openEdit(product)} className="p-2 hover:bg-muted/70 rounded-lg text-foreground/40 hover:text-primary transition-colors">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button type="button" onClick={() => handleDelete(product.id)} className="p-2 hover:bg-muted/70 rounded-lg text-foreground/40 hover:text-red-400 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── ORDERS TAB ── */}
                {activeTab === 'orders' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-serif font-light">Orders</h2>
                            <p className="text-sm text-foreground/40 mt-1">Review purchases and update delivery status.</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl overflow-hidden">
                            {isLoading ? (
                                <div className="py-16 text-center text-foreground/30 animate-pulse">Loading orders…</div>
                            ) : orders.length === 0 ? (
                                <div className="py-16 text-center text-foreground/30">No orders yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-background">
                                                {['Order', 'Date', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-foreground/30 font-medium">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <React.Fragment key={order.id}>
                                                    <tr className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                                        <td className="px-5 py-4 font-mono text-xs text-foreground/40">#{order.id.slice(0, 8)}</td>
                                                        <td className="px-5 py-4 text-sm text-foreground/70">{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td className="px-5 py-4">
                                                            <span className="font-bold text-foreground">৳{order.total_amount?.toFixed(0)}</span>
                                                            {order.transaction_id && (
                                                                <div className="text-[9px] text-primary font-mono mt-1 bg-primary/10 px-1.5 py-0.5 rounded border border-[#b8976a]/20">
                                                                    Trnx: {order.transaction_id}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                                                            {order.payment_method || 'COD'}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-col gap-2 items-start">
                                                                <div className="flex items-center gap-2">
                                                                    <select
                                                                        value={order.status}
                                                                        onChange={e => handleOrderStatus(order.id, e.target.value, order.delivery_info, order.admin_notes)}
                                                                        className="text-xs font-bold bg-shadow-layer border border-border rounded-lg px-2 py-1.5 text-foreground outline-none focus:border-[#b8976a]/50 transition-colors"
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="packing">Packing</option>
                                                                        <option value="shipping">Shipping</option>
                                                                        <option value="delivered">Delivered</option>
                                                                        <option value="cancelled">Cancelled</option>
                                                                    </select>

                                                                    <button type="button"
                                                                        onClick={() => setEditingDelivery({ id: order.id, value: order.delivery_info || '' })}
                                                                        className={`p-1.5 rounded-lg transition-colors ${order.delivery_info ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-foreground/30'} hover:bg-blue-500/20`}
                                                                        title="Delivery info"
                                                                    >
                                                                        <Clock className="w-4 h-4" />
                                                                    </button>

                                                                    <button type="button"
                                                                        onClick={() => setEditingNotes({ id: order.id, value: order.admin_notes || '' })}
                                                                        className={`p-1.5 rounded-lg transition-colors ${order.admin_notes ? 'bg-primary/15 text-primary' : 'bg-white/5 text-foreground/30'} hover:bg-primary/20`}
                                                                        title="Admin notes"
                                                                    >
                                                                        <MessageSquare className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                {/* Inline delivery editor */}
                                                                {editingDelivery?.id === order.id && (
                                                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            value={editingDelivery.value}
                                                                            onChange={e => setEditingDelivery({ ...editingDelivery, value: e.target.value })}
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter') {
                                                                                    handleOrderStatus(order.id, order.status, editingDelivery.value, order.admin_notes);
                                                                                    setEditingDelivery(null);
                                                                                }
                                                                                if (e.key === 'Escape') setEditingDelivery(null);
                                                                            }}
                                                                            placeholder="Courier & Phone"
                                                                            className="text-xs bg-background border border-blue-400/50 rounded px-2 py-1 text-foreground w-40 outline-none"
                                                                        />
                                                                        <button type="button" onClick={() => { handleOrderStatus(order.id, order.status, editingDelivery.value, order.admin_notes); setEditingDelivery(null); }} className="p-1 bg-blue-500/20 text-blue-400 rounded"><Check className="w-3 h-3" /></button>
                                                                        <button type="button" onClick={() => setEditingDelivery(null)} className="p-1 bg-white/5 text-foreground/30 rounded"><X className="w-3 h-3" /></button>
                                                                    </motion.div>
                                                                )}

                                                                {/* Inline notes editor */}
                                                                {editingNotes?.id === order.id && (
                                                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            value={editingNotes.value}
                                                                            onChange={e => setEditingNotes({ ...editingNotes, value: e.target.value })}
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter') {
                                                                                    handleOrderStatus(order.id, order.status, order.delivery_info, editingNotes.value);
                                                                                    setEditingNotes(null);
                                                                                }
                                                                                if (e.key === 'Escape') setEditingNotes(null);
                                                                            }}
                                                                            placeholder="Note / reason…"
                                                                            className="text-xs bg-background border border-[#b8976a]/50 rounded px-2 py-1 text-foreground w-48 outline-none"
                                                                        />
                                                                        <button type="button" onClick={() => { handleOrderStatus(order.id, order.status, order.delivery_info, editingNotes.value); setEditingNotes(null); }} className="p-1 bg-primary/15 text-primary rounded"><Check className="w-3 h-3" /></button>
                                                                        <button type="button" onClick={() => setEditingNotes(null)} className="p-1 bg-white/5 text-foreground/30 rounded"><X className="w-3 h-3" /></button>
                                                                    </motion.div>
                                                                )}

                                                                {order.delivery_info && !editingDelivery && (
                                                                    <p className="text-[10px] text-blue-400 max-w-[160px] truncate">📦 {order.delivery_info}</p>
                                                                )}
                                                                {order.admin_notes && !editingNotes && (
                                                                    <p className="text-[10px] text-primary max-w-[160px] truncate">💬 {order.admin_notes}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Order Items sub-row */}
                                                    {order.order_items?.length > 0 && (
                                                        <tr className="bg-background/50 border-b border-border/50">
                                                            <td colSpan={6} className="px-5 py-3">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {order.order_items.map(item => (
                                                                        <button
                                                                            key={item.id}
                                                                            type="button"
                                                                            onClick={() => setPreviewProduct(item.products)}
                                                                            className="flex items-center gap-2 bg-shadow-layer border border-border px-3 py-2 rounded-lg hover:border-[#b8976a]/30 transition-all group text-left"
                                                                        >
                                                                            <div className="w-8 h-8 bg-[#222] rounded overflow-hidden flex-shrink-0">
                                                                                {item.products?.images?.[0] && <img src={item.products.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[10px] font-bold text-foreground">{item.products?.name}</p>
                                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                                    {item.selected_size && <span className="text-[8px] font-bold bg-primary/20 text-primary px-1 rounded">{item.selected_size}</span>}
                                                                                    <span className="text-[9px] text-foreground/30">×{item.quantity}</span>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── SALES TAB ── */}
                {activeTab === 'sales' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-serif font-light">Sales & Analytics</h2>
                            <p className="text-sm text-foreground/40 mt-1">Your store performance at a glance.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[
                                { label: 'Total Revenue', value: `৳${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'green' },
                                { label: 'Total Sales', value: activeOrders.length, icon: ShoppingBag, color: 'blue' },
                                { label: 'Pending Orders', value: pendingCount, icon: Clock, color: 'yellow' },
                            ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="bg-card border border-border rounded-xl p-6">
                                    <div className={`inline-flex p-3 rounded-lg mb-4 ${
                                        color === 'green' ? 'bg-green-500/10 text-green-400' :
                                        color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mb-1">{label}</p>
                                    <p className="text-3xl font-serif font-light text-foreground">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-card border border-border rounded-xl p-8 text-center">
                            <TrendingUp className="w-10 h-10 text-foreground/10 mx-auto mb-4" />
                            <h3 className="text-lg font-serif font-light mb-2">Detailed Analytics Coming Soon</h3>
                            <p className="text-foreground/30 text-sm">Charts and growth data will appear here once enough orders are collected.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* ── PRODUCT MODAL ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-5 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                                <h3 className="font-serif text-lg font-light">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-lg text-foreground/40 hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-1.5">Product Name *</label>
                                    <input required type="text" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#b8976a]/60 transition-colors"
                                        placeholder="e.g. Premium Oversized Tee"
                                    />
                                </div>

                                {/* Category & Stock */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-1.5">Category *</label>
                                        <select value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#b8976a]/60 transition-colors"
                                        >
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-1.5">Stock *</label>
                                        <input required type="number" min="0" value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#b8976a]/60 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Price & Discount */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-1.5">Regular Price (BDT) *</label>
                                        <input required type="number" min="0" value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="1200"
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#b8976a]/60 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-1.5">Discount Price (Optional)</label>
                                        <input type="number" min="0" value={formData.discount_price}
                                            onChange={e => setFormData({ ...formData, discount_price: e.target.value })}
                                            placeholder="999"
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#b8976a]/60 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* On Sale Toggle */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, is_on_sale: !p.is_on_sale }))}
                                        className={`relative w-10 h-6 rounded-full transition-colors ${formData.is_on_sale ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.is_on_sale ? 'left-5' : 'left-1'}`} />
                                    </button>
                                    <span className="text-sm text-foreground/70">Display "ON SALE" badge</span>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-1.5">Description</label>
                                    <textarea rows={2} value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#b8976a]/60 transition-colors resize-none"
                                        placeholder="Brief product description…"
                                    />
                                </div>

                                {/* Sizes */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Available Sizes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map(size => (
                                            <button key={size} type="button" onClick={() => toggleSize(size)}
                                                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                    formData.sizes.includes(size)
                                                        ? 'bg-primary text-primary-foreground border-[#b8976a]'
                                                        : 'bg-transparent text-foreground/40 border-border hover:border-white/30'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Image Upload & Management */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-1.5 flex justify-between">
                                        <span>Product Images</span>
                                        <span className="text-foreground/30 lowercase">first image is primary</span>
                                    </label>
                                    
                                    {/* Existing images */}
                                    {formData.images?.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mb-3">
                                            {formData.images.map((img, i) => (
                                                <div key={img} className="relative w-16 h-20 rounded border border-border overflow-hidden group">
                                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload trigger */}
                                    <label
                                        className="relative flex flex-col items-center justify-center p-6 bg-background border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-[#b8976a]/40 transition-colors"
                                    >
                                        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                                            onChange={e => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length > 0) {
                                                    setImageFiles(prev => [...prev, ...files]);
                                                    const newPreviews = files.map(file => URL.createObjectURL(file));
                                                    setPreviewImages(prev => [...prev, ...newPreviews]);
                                                }
                                            }}
                                        />
                                        
                                        <UploadCloud className="w-6 h-6 text-foreground/20 mb-2" />
                                        <span className="text-sm text-foreground/40">Click to add images</span>
                                    </label>

                                    {/* Unsaved Preview images */}
                                    {previewImages.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {previewImages.map((src, i) => (
                                                <div key={src} className="relative w-16 h-20 rounded border border-[#b8976a]/30 overflow-hidden">
                                                    <img src={src} className="w-full h-full object-cover opacity-80" alt="" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            setPreviewImages(prev => prev.filter((_, idx) => idx !== i));
                                                            setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                                                        }}
                                                        className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-foreground/60 hover:text-foreground"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                    <button type="button" onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 border border-border text-foreground/60 rounded-lg text-sm hover:bg-muted transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isUploading}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-[#c9a87b] transition-colors disabled:opacity-50">
                                        {isUploading ? 'Uploading…' : editingProductId ? 'Save Changes' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── PRODUCT PREVIEW MODAL ── */}
            <AnimatePresence>
                {previewProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setPreviewProduct(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="md:w-1/2 bg-background flex items-center justify-center min-h-[250px]">
                                {previewProduct.images?.[0] ? (
                                    <img src={previewProduct.images[0]} className="w-full h-full object-cover" alt={previewProduct.name} />
                                ) : (
                                    <div className="text-foreground/20 font-serif text-lg">No Image</div>
                                )}
                            </div>
                            <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-serif font-light text-foreground mb-1">{previewProduct.name}</h3>
                                        <p className="text-xs uppercase tracking-widest text-primary">{previewProduct.category}</p>
                                    </div>
                                    <button type="button" onClick={() => setPreviewProduct(null)} className="p-2 hover:bg-muted rounded-lg text-foreground/30 hover:text-foreground transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-3 mb-6">
                                    <p className="text-3xl font-serif text-primary">৳{previewProduct.discount_price || previewProduct.price}</p>
                                    {previewProduct.discount_price && <p className="text-lg text-foreground/30 line-through">৳{previewProduct.price}</p>}
                                </div>

                                <div className="bg-white/3 border border-border rounded-xl p-4 space-y-4 mb-4">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-foreground/30 mb-2">Available Sizes</p>
                                        <div className="flex flex-wrap gap-2">
                                            {previewProduct.sizes?.map(s => (
                                                <span key={s} className="px-3 py-1 bg-white/5 border border-border rounded-lg text-sm font-bold text-foreground/70">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-foreground/30 mb-1">Stock</p>
                                        <p className={`text-sm font-bold ${(previewProduct.stock || 0) <= 5 ? 'text-red-400' : 'text-foreground'}`}>
                                            {previewProduct.stock ?? '–'} units available
                                        </p>
                                    </div>
                                    {previewProduct.description && (
                                        <div>
                                            <p className="text-[9px] uppercase tracking-widest text-foreground/30 mb-1">Description</p>
                                            <p className="text-sm text-foreground/60 leading-relaxed">{previewProduct.description}</p>
                                        </div>
                                    )}
                                </div>

                                <button type="button" onClick={() => setPreviewProduct(null)}
                                    className="mt-auto w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-[#c9a87b] transition-colors">
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
