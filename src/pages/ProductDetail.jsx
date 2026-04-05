import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Check } from 'lucide-react';
import WhatsAppButton from '../components/layout/WhatsAppButton';
import { useCart } from '@/lib/CartContext';

const SIZES = ['S', 'M', 'L', 'XL'];

import { useToast } from '@/components/ui/use-toast';

export default function ProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = window.location.pathname.split('/product/')[1];

    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);
    const imageRef = useRef(null);
    const { addToCart, openCart } = useCart();
    const { toast } = useToast();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!productId,
    });

    // Auto-select first size once product is loaded
    React.useEffect(() => {
        if (product && !selectedSize) {
            const sizes = product.sizes_available?.length ? product.sizes_available : SIZES;
            if (sizes.length > 0) setSelectedSize(sizes[0]);
        }
    }, [product, selectedSize]);

    // Auto-loop images every 5 seconds
    React.useEffect(() => {
        if (!product || !product.images || product.images.length <= 1) return;
        const intervalId = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % product.images.length);
        }, 5000);
        return () => clearInterval(intervalId);
    }, [product]);

    const handleMouseMove = (e) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast({ title: "Selection Required", description: "Please select a size", variant: "destructive" });
            return;
        }

        addToCart(product, selectedSize, null, quantity);
        toast({ title: "Added to your selection", description: "Check your cart to complete the order." });
        openCart();
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            toast({ title: "Selection Required", description: "Please select a size", variant: "destructive" });
            return;
        }
        addToCart(product, selectedSize, null, quantity);
        openCart();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="aspect-[3/4] bg-shadow-layer animate-pulse rounded-sm" />
                    <div className="space-y-6">
                        <div className="h-8 bg-shadow-layer animate-pulse rounded w-3/4" />
                        <div className="h-6 bg-shadow-layer animate-pulse rounded w-1/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <p className="font-serif text-2xl text-muted-foreground">Product not found</p>
            </div>
        );
    }

    const images = product.images?.length ? product.images : ['/placeholder.jpg'];

    return (
        <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Images */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                >
                    {/* Main image with zoom */}
                    <div
                        ref={imageRef}
                        className="relative overflow-hidden rounded-sm aspect-[3/4] bg-shadow-layer cursor-crosshair"
                        onMouseEnter={() => setShowZoom(true)}
                        onMouseLeave={() => setShowZoom(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <img
                            src={images[activeImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {showZoom && (
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    backgroundImage: `url(${images[activeImage]})`,
                                    backgroundSize: '200%',
                                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                                }}
                            />
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-3">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-20 rounded-sm overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-primary' : 'border-transparent'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Product details - sticky */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="lg:sticky lg:top-28 lg:self-start space-y-8"
                >
                    <div>
                        <p className="text-xs tracking-luxury uppercase text-primary mb-3">
                            {product.category?.replace(/-/g, ' ')}
                        </p>
                        <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                            {product.name}
                        </h1>
                    </div>

                    <p className="font-serif text-2xl text-primary">
                        BDT {product.price?.toLocaleString()}
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-border/30" />

                    {/* Description */}
                    {product.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    {/* Fabric details */}
                    {product.fabric_details && (
                        <div>
                            <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-2">Fabric & Care</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{product.fabric_details}</p>
                        </div>
                    )}

                    {/* Size selection */}
                    <div>
                        <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">Select Size</p>
                        <div className="flex gap-3">
                            {(product.sizes_available?.length ? product.sizes_available : SIZES).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 rounded-sm border text-xs tracking-wider transition-all duration-300 flex items-center justify-center ${selectedSize === size
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border/50 text-muted-foreground hover:border-primary hover:text-foreground'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">Quantity</p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-sm w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-[#b8976a] text-black hover:bg-[#c9a87b] font-bold text-xs tracking-luxury uppercase py-4 rounded-sm transition-colors"
                        >
                            Add to Selection
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="w-full bg-foreground border border-primary/50 text-background hover:border-primary hover:opacity-90 font-bold text-xs tracking-luxury uppercase py-4 rounded-sm transition-colors"
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="pt-6 space-y-3 border-t border-border/20">
                        {['Free shipping on orders over BDT 5,000', 'Handcrafted with premium materials', '7-day exchange policy'].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {text}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <WhatsAppButton productName={product.name} />
        </div>
    );
}