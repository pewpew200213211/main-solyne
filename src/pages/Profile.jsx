import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import { Package, Clock, Truck, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { data: profile, isLoading: loadingProfile } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['orders', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (*)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
    });

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-24 px-6 md:px-16 lg:px-24 flex items-center justify-center text-center">
                <div className="space-y-6 max-w-sm">
                    <h1 className="font-serif text-3xl text-foreground">Authentication Required</h1>
                    <p className="text-muted-foreground text-sm">Please sign in to view your archive and order timeline.</p>
                    <button onClick={() => navigate('/auth')} className="w-full bg-white text-black py-4 text-xs tracking-luxury uppercase font-medium hover:bg-neutral-200 transition-colors rounded-sm">
                        Sign In / Register
                    </button>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'packing': return <Package className="w-5 h-5 text-blue-500" />;
            case 'shipping': return <Truck className="w-5 h-5 text-purple-500" />;
            case 'delivered': return <CheckCircle2 className="w-5 h-5 text-primary" />;
            case 'cancelled': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getTimelineProgress = (status) => {
        const stages = ['pending', 'packing', 'shipping', 'delivered'];
        const index = stages.indexOf(status);
        return index === -1 ? 0 : index;
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Profile Info */}
            <div className="w-full lg:w-1/4 space-y-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="p-8 bg-shadow-layer border border-border/40 rounded-sm space-y-6"
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 text-primary font-serif text-2xl uppercase">
                        {profile?.full_name?.[0] || user.email[0]}
                    </div>
                    <div>
                        <h2 className="font-serif text-xl text-foreground mb-1">{profile?.full_name || 'Valued Client'}</h2>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="pt-6 border-t border-border/40">
                        <button 
                            onClick={handleSignOut}
                            className="flex items-center gap-3 text-xs tracking-wider uppercase text-muted-foreground hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Orders Feed */}
            <div className="w-full lg:w-3/4 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h2 className="font-serif text-3xl text-foreground mb-8">Your Archive</h2>

                    {loadingOrders ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-shadow-layer animate-pulse rounded-sm" />)}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-24 bg-shadow-layer border border-border/40 rounded-sm">
                            <p className="text-muted-foreground">No selections in your archive yet.</p>
                            <button onClick={() => navigate('/shop')} className="mt-4 px-8 py-3 border border-border/50 text-xs tracking-luxury uppercase hover:bg-white hover:text-black transition-colors rounded-sm">
                                Explore Collection
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map((order, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 * i }}
                                    key={order.id} 
                                    className="bg-shadow-layer border border-border/40 rounded-sm p-6"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/30">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Order ID: {order.id}</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm px-4 py-2 bg-background border border-border/40 rounded-sm w-fit capitalize">
                                            {getStatusIcon(order.status)}
                                            <span className="text-foreground tracking-wide font-medium">{order.status}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase tracking-luxury text-muted-foreground border-b border-border/30 pb-2">Selections</h4>
                                            {order.order_items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-12 h-16 bg-background rounded-sm overflow-hidden shrink-0">
                                                        <img src={item.products?.images?.[0]} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-foreground line-clamp-1">{item.products?.name}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-1">Qty: {item.quantity} × ৳{item.price_at_purchase?.toLocaleString()}</p>
                                                        {(item.selected_size || item.selected_color) && (
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                {item.selected_size && `Size: ${item.selected_size}`}
                                                                {item.selected_size && item.selected_color && ' | '}
                                                                {item.selected_color && `Color: ${item.selected_color}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2">
                                                <p className="font-serif text-xl lg:text-2xl text-foreground">Total: ৳{order.total_amount?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase tracking-luxury text-muted-foreground border-b border-border/30 pb-2">Delivery Details</h4>
                                            <div className="space-y-2 text-sm text-foreground/80">
                                                <p><span className="text-muted-foreground">Address:</span> {order.shipping_address}</p>
                                                <p><span className="text-muted-foreground">Phone:</span> {order.contact_number}</p>
                                                <p><span className="text-muted-foreground">Payment:</span> {order.payment_method}</p>
                                            </div>

                                            {/* Delivery Timeline / Admin Note */}
                                            {order.delivery_info && (
                                                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-sm">
                                                    <p className="text-[10px] uppercase tracking-luxury text-primary mb-2">Delivery Note / Tracking Info</p>
                                                    <p className="text-sm text-foreground">{order.delivery_info}</p>
                                                </div>
                                            )}
                                            {order.admin_notes && (
                                                <div className="mt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
                                                    <p className="text-[10px] uppercase tracking-luxury text-yellow-500 mb-2">Message from Admin</p>
                                                    <p className="text-sm text-foreground">{order.admin_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Visual Timeline */}
                                    {order.status !== 'cancelled' && (
                                        <div className="relative pt-4 border-t border-border/30">
                                            <div className="overflow-hidden h-1 mt-4 mb-2 bg-background flex rounded-full w-full">
                                                {['pending', 'packing', 'shipping', 'delivered'].map((stage, i) => (
                                                    <div 
                                                        key={stage} 
                                                        className={`h-full border-r border-background shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                                            i <= getTimelineProgress(order.status) ? 'bg-primary' : 'bg-transparent'
                                                        }`}
                                                        style={{ width: '25%' }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground tracking-widest uppercase">
                                                <span className={getTimelineProgress(order.status) >= 0 ? "text-primary font-bold" : ""}>Pending</span>
                                                <span className={getTimelineProgress(order.status) >= 1 ? "text-primary font-bold" : ""}>Packing</span>
                                                <span className={getTimelineProgress(order.status) >= 2 ? "text-primary font-bold" : ""}>Shipping</span>
                                                <span className={getTimelineProgress(order.status) >= 3 ? "text-primary font-bold" : ""}>Delivered</span>
                                            </div>
                                        </div>
                                    )}

                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
