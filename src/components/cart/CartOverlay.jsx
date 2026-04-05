import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/api/supabase';
import { useQueryClient } from '@tanstack/react-query';

export default function CartOverlay({ open, onClose, items = [] }) {
    const queryClient = useQueryClient();

    const updateQuantity = async (item, delta) => {
        const newQty = (item.quantity || 1) + delta;
        if (newQty <= 0) {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', item.id);
            if (error) console.error('Delete failed:', error);
        } else {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', item.id);
            if (error) console.error('Update failed:', error);
        }
        queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    };

    const removeItem = async (id) => {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id);
        if (error) console.error('Remove failed:', error);
        queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    };

    const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const handleCheckout = () => {
        const message = items.map(item =>
            `${item.product_name} (${item.size}) x${item.quantity || 1} - BDT ${(item.price * (item.quantity || 1)).toLocaleString()}`
        ).join('\n');
        const whatsappMsg = `Hello SOLYNÉ, I would like to place an order:\n\n${message}\n\nTotal: BDT ${total.toLocaleString()}`;
        window.open(`https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-obsidian border-l border-border/30 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/20">
                            <h2 className="font-serif text-xl tracking-luxury">Private Selection</h2>
                            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="font-serif text-lg text-muted-foreground">Your selection is empty</p>
                                    <p className="text-sm text-muted-foreground/60 mt-2">Curate your wardrobe</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        {item.image_url && (
                                            <img
                                                src={item.image_url}
                                                alt={item.product_name}
                                                className="w-20 h-24 object-cover rounded-sm"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-serif text-sm text-foreground truncate">{item.product_name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                                            <p className="text-sm text-primary font-serif mt-1">BDT {item.price?.toLocaleString()}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button onClick={() => updateQuantity(item, -1)} className="text-muted-foreground hover:text-foreground">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-xs w-6 text-center">{item.quantity || 1}</span>
                                                <button onClick={() => updateQuantity(item, 1)} className="text-muted-foreground hover:text-foreground">
                                                    <Plus size={14} />
                                                </button>
                                                <button onClick={() => removeItem(item.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-border/20 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground tracking-luxury uppercase">Total</span>
                                    <span className="font-serif text-xl text-primary">BDT {total.toLocaleString()}</span>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs tracking-luxury uppercase py-6"
                                >
                                    Checkout via WhatsApp
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}