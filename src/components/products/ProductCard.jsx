import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { ShoppingBag, CreditCard } from 'lucide-react';

export default function ProductCard({ product }) {
    const [hovered, setHovered] = useState(false);
    const { addToCart, openCart } = useCart();
    const navigate = useNavigate();

    const hasDiscount = Boolean(product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price));
    const activePrice = hasDiscount ? product.discount_price : product.price;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, product.sizes?.[0] || 'Default', product.colors?.[0] || '');
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, product.sizes?.[0] || 'Default', product.colors?.[0] || '');
        openCart();
    };

    const goToProduct = () => {
        navigate(`/product/${product.id}`);
    };

    const displayImage = hovered && product.images?.length > 1 
        ? product.images[1] 
        : (product.images?.[0] || '/placeholder.jpg');

    return (
        <div 
            className="group block relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div onClick={goToProduct} className="cursor-pointer relative overflow-hidden bg-shadow-layer rounded-sm aspect-[3/4]">
                <motion.img
                    key={displayImage} // Force re-render for smooth transition
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1, scale: hovered ? 1.05 : 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />

                {/* Hover overlay with Add To Cart buttons on Desktop */}
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex gap-2 justify-center hidden md:flex"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking overlay
                        >
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-black/50 hover:bg-white text-white hover:text-black backdrop-blur-md text-[10px] tracking-luxury uppercase py-3 px-1 transition-colors flex justify-center items-center gap-1.5 border border-white/20 hover:border-white rounded-sm"
                            >
                                <ShoppingBag size={14} /> Add
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] tracking-luxury uppercase py-3 px-1 transition-colors flex justify-center items-center gap-1.5 rounded-sm"
                            >
                                <CreditCard size={14} /> Buy
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Limited / Sale badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_limited && (
                        <div className="px-3 py-1 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-sm">
                            <span className="text-[10px] tracking-luxury uppercase text-primary">Limited</span>
                        </div>
                    )}
                    {product.is_on_sale && (
                        <div className="px-3 py-1 bg-[#8b0000]/80 backdrop-blur-sm border border-[#8b0000]/50 rounded-sm">
                            <span className="text-[10px] tracking-luxury uppercase text-white">Sale</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Product info */}
            <div className="mt-4 flex flex-col space-y-1 relative">
                <Link to={`/product/${product.id}`} className="font-serif text-base text-foreground hover:text-primary transition-colors duration-300">
                    {product.name}
                </Link>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground tracking-wide uppercase">
                        {product.category?.replace(/-/g, ' ')}
                    </p>
                    
                    <div className="flex gap-2 items-center">
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                                ৳{product.price?.toLocaleString()}
                            </span>
                        )}
                        <span className={`font-serif text-sm ${hasDiscount ? 'text-primary' : 'text-foreground'}`}>
                            ৳{activePrice?.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Mobile Quick Actions (always visible on small screens) */}
                <div className="flex md:hidden gap-2 pt-3 mt-2 border-t border-border/30">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 border border-border text-foreground hover:bg-white hover:text-black text-[10px] tracking-luxury uppercase py-2 transition-colors rounded-sm"
                    >
                        Select
                    </button>
                    <button
                        onClick={handleBuyNow}
                        className="flex-1 bg-primary text-primary-foreground text-[10px] tracking-luxury uppercase py-2 transition-colors rounded-sm"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}