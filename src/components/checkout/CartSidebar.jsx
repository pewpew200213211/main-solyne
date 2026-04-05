import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderService } from '@/lib/orderService';
import { supabase } from '@/api/supabase';

export default function CartSidebar() {
    const { cart, updateQuantity, removeFromCart, clearCart, isCartOpen, closeCart } = useCart();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [error, setError] = useState(null);

    // Form states
    const [shippingAddress, setShippingAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [transactionId, setTransactionId] = useState('');

    const subtotal = cart.reduce((sum, item) => sum + (item.discount_price ?? item.price) * item.quantity, 0);

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        if (!shippingAddress.trim() || !contactNumber.trim()) {
            setError("Please provide a shipping address and contact number.");
            setIsProcessing(false);
            return;
        }

        if ((paymentMethod === 'bKash' || paymentMethod === 'Nagad') && !transactionId.trim()) {
            setError(`Please provide the transaction ID for your ${paymentMethod} payment.`);
            setIsProcessing(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/auth');
                closeCart();
                return;
            }

            const orderItems = cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.discount_price ?? item.price,
                selected_color: item.selectedColor,
                selected_size: item.selectedSize
            }));

            const order = await orderService.createOrder(
                orderItems,
                subtotal,
                shippingAddress,
                contactNumber,
                paymentMethod,
                (paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? transactionId : null
            );

            setOrderId(order.id);
            clearCart();
            setShippingAddress('');
            setContactNumber('');
            setTransactionId('');
        } catch (err) {
            console.error("Checkout failed:", err);
            setError(err.message || 'Error processing your order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeCart}
            />

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-y-0 right-0 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-6 border-b border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="font-serif text-2xl text-foreground">Cart</h2>
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-sm">
                            {cart.length}
                        </span>
                    </div>
                    <button onClick={closeCart} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    {orderId ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30"
                            >
                                <CheckCircle2 className="w-10 h-10 text-primary" />
                            </motion.div>
                            <h3 className="font-serif text-3xl text-foreground">Order Confirmed</h3>
                            
                            <div className="space-y-4">
                                <p className="text-muted-foreground text-sm">Thank you for acquiring a piece of SOLYNÉ.</p>
                                {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                                    <div className="bg-shadow-layer p-4 rounded-sm border border-border/40 text-xs text-muted-foreground leading-relaxed">
                                        Our artisan team will verify your transaction shortly. The confirmation will reflect in your profile. 
                                    </div>
                                )}
                                <p className="text-xs font-mono text-primary/70 bg-primary/5 py-2 px-4 rounded-sm border border-primary/10">
                                    ID: {orderId}
                                </p>
                            </div>
                            
                            <div className="pt-8 space-y-3 w-full">
                                <button
                                    onClick={() => { closeCart(); navigate('/profile'); setOrderId(null); }}
                                    className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-luxury uppercase font-medium rounded-sm border border-primary"
                                >
                                    Proceed to Profile
                                </button>
                            </div>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                            <h3 className="font-serif text-2xl text-foreground">Your Archive is Empty</h3>
                            <button
                                onClick={() => { closeCart(); navigate('/shop'); }}
                                className="px-8 py-3 bg-white text-black hover:bg-white/90 text-xs tracking-luxury uppercase font-medium transition-colors"
                            >
                                Explore Collection
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-sm flex items-start gap-3 text-red-400">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-xs leading-relaxed">{error}</p>
                                </div>
                            )}

                            {cart.map((item) => (
                                <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 group">
                                    <div className="w-20 h-24 bg-shadow-layer rounded-sm overflow-hidden shrink-0">
                                        <img src={item.images?.[0] || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between">
                                            <h4 className="font-serif text-base text-foreground line-clamp-1">{item.name}</h4>
                                            <p className="text-sm font-medium text-foreground">৳{(item.discount_price ?? item.price).toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                                            {item.category} 
                                            {item.selectedSize && ` • ${item.selectedSize}`}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center border border-border/50 rounded-sm overflow-hidden bg-shadow-layer">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                                                    className="p-1.5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                                    disabled={isProcessing}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-7 text-center text-xs font-medium text-foreground">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                                                    className="p-1.5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                                    disabled={isProcessing}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                                className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                                                disabled={isProcessing}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with Checkout Details */}
                {cart.length > 0 && !orderId && (
                    <div className="p-6 bg-card border-t border-border/40 space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-muted-foreground uppercase tracking-luxury mb-2">Shipping Details</label>
                                <textarea 
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    placeholder="Full delivery address..."
                                    className="w-full bg-shadow-layer border border-border/50 focus:border-primary/50 text-foreground text-xs p-3 outline-none resize-none h-16 rounded-sm mb-2 transition-colors"
                                />
                                <input 
                                    type="tel"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    placeholder="Contact Number (+880...)"
                                    className="w-full bg-shadow-layer border border-border/50 focus:border-primary/50 text-foreground text-xs px-3 py-2.5 outline-none rounded-sm transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] text-muted-foreground uppercase tracking-luxury mb-2">Payment</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['COD', 'bKash', 'Nagad'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`py-2 px-1 text-[10px] uppercase tracking-wider font-medium border transition-all rounded-sm ${
                                                paymentMethod === method 
                                                    ? 'bg-primary text-primary-foreground border-primary' 
                                                    : 'bg-transparent text-muted-foreground border-border/40 hover:border-border'
                                            }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3 p-3 bg-shadow-layer border border-border/50 rounded-sm"
                                    >
                                        <input 
                                            required
                                            type="text" 
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder={`Enter ${paymentMethod} Trnx ID`}
                                            className="w-full bg-background border border-border/50 text-foreground text-xs px-3 py-2 outline-none focus:border-primary/50 rounded-sm transition-colors"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                                            Send total amount to <span className="text-foreground tracking-widest">01XXXXXXXXX</span> via Send Money.
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-end py-4 border-t border-border/40 mt-4">
                            <span className="text-[10px] uppercase tracking-luxury text-muted-foreground">Subtotal</span>
                            <span className="font-serif text-2xl text-foreground">৳{subtotal.toLocaleString()}</span>
                        </div>
                        
                        <button 
                            onClick={handleCheckout}
                            disabled={isProcessing || !shippingAddress.trim() || !contactNumber.trim()}
                            className="w-full bg-foreground text-background py-4 text-xs tracking-luxury uppercase font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Processing
                                </div>
                            ) : 'Finalize Selection'}
                        </button> 
                    </div>
                )}
            </motion.div>
        </div>
    );
}
