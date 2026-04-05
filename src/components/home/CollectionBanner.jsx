import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BANNER_IMAGE = "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/104316499_generated_08711ae5.png";

export default function CollectionBanner() {
    return (
        <section className="relative py-12 md:py-0">
            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
                <div className="relative overflow-hidden rounded-sm h-[60vh] md:h-[70vh]">
                    <motion.img
                        src={BANNER_IMAGE}
                        alt="SOLYNÉ Limited Collection"
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/50 to-obsidian/30" />

                    <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6 max-w-lg"
                        >
                            <p className="text-xs tracking-luxury uppercase text-primary">
                                Limited Edition
                            </p>
                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-parchment leading-tight">
                                The Heritage<br />
                                <span className="italic">Collection</span>
                            </h2>
                            <p className="text-sm text-parchment/60 leading-relaxed max-w-sm">
                                A capsule of twelve pieces, each numbered and signed.
                                Once they're gone, they're gone forever.
                            </p>
                            <Link
                                to="/shop"
                                className="inline-block mt-4 px-8 py-3 border border-primary text-xs tracking-luxury uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500"
                            >
                                Discover Now
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}