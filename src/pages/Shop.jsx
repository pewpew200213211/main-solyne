import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import ProductCard from '../components/products/ProductCard';

const CATEGORIES = [
    { value: 'all', label: 'All' },
    { value: 'Shirts', label: 'Shirts' },
    { value: 'Drop Shoulder Tees', label: 'Drop Shoulder Tees' },
    { value: 'Vaggy Pants', label: 'Pants' },
    { value: 'Accessories', label: 'Accessories' },
];

export default function Shop() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [visibleCount, setVisibleCount] = useState(8);

    // Reset visible count when category changes to start from 8 items
    useEffect(() => {
        setVisibleCount(8);
    }, [activeCategory]);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');
            if (error) throw error;
            
            // Randomize the products collection
            return (data || []).sort(() => Math.random() - 0.5);
        },
        initialData: [],
    });

    const filtered = activeCategory === 'all'
        ? products
        : products.filter(p => p.category === activeCategory);

    const visibleProducts = filtered.slice(0, visibleCount);
    // Check if there are more products to load beyond what is currently visible
    const hasMore = visibleCount < filtered.length;

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16 md:mb-24"
            >
                <p className="text-xs tracking-luxury uppercase text-primary mb-4">The Archive</p>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light text-foreground">
                    Shop
                </h1>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-8 mb-16 border-b border-border/20 pb-6"
            >
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setActiveCategory(cat.value)}
                        className={`text-xs tracking-luxury uppercase transition-colors duration-300 pb-2 border-b-2 ${activeCategory === cat.value
                                ? 'text-primary border-primary'
                                : 'text-muted-foreground border-transparent hover:text-foreground'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </motion.div>

            {/* Products grid */}
            {isLoading ? (
                // 4x2 grid skeleton
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-shadow-layer rounded-sm animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-32">
                    <p className="font-serif text-2xl text-muted-foreground">No pieces found</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">Check back soon for new arrivals</p>
                </div>
            ) : (
                <>
                    {/* 4x2 grid implementation (lg:grid-cols-4) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                        <AnimatePresence mode="popLayout">
                            {visibleProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: (index % 8) * 0.08 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Load More Button */}
                    <AnimatePresence>
                        {hasMore && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-20 flex justify-center"
                            >
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 8)}
                                    className="px-10 py-4 border border-border/40 text-xs tracking-luxury uppercase font-medium hover:bg-white hover:text-black hover:border-white transition-all duration-300 rounded-sm"
                                >
                                    Load More
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}