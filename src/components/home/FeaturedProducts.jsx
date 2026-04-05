import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import ProductCard from '../products/ProductCard';

export default function FeaturedProducts() {
    const [visibleCount, setVisibleCount] = useState(8);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['landingProducts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');
            if (error) throw error;
            // Randomize the entire collection
            return (data || []).sort(() => Math.random() - 0.5);
        },
        initialData: [],
    });

    const visibleProducts = products.slice(0, visibleCount);
    const hasMore = visibleCount < products.length;

    return (
        <section className="py-24 md:py-40 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className="mb-16 md:mb-24"
            >
                <p className="text-xs tracking-luxury uppercase text-primary mb-4">Curated Essentials</p>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                        The Collection
                    </h2>
                    <Link
                        to="/shop"
                        className="text-xs tracking-luxury uppercase text-muted-foreground hover:text-primary transition-colors"
                    >
                        View All →
                    </Link>
                </div>
            </motion.div>

            {/* Products grid */}
            {isLoading ? (
                // 4x2 grid skeleton
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-shadow-layer rounded-sm animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                                    className="px-10 py-4 border border-border/40 text-xs tracking-luxury uppercase font-medium hover:bg-white hover:text-black hover:border-white transition-all duration-300 rounded-sm cursor-pointer"
                                    style={{ position: 'relative', zIndex: 10 }}
                                >
                                    Load More
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </section>
    );
}