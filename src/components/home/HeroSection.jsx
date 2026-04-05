import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HERO_IMAGE = "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/00731eaab_generated_9410a7d4.png";

export default function HeroSection() {
    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background image container with entrance fade-up */}
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
                {/* Continuous slow background zoom */}
                <motion.img
                    src={HERO_IMAGE}
                    alt="SOLYNÉ model wearing premium clothing"
                    className="w-full h-full object-cover object-center"
                    initial={{ scale: 1.0 }}
                    animate={{ scale: 1.15 }}
                    transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="space-y-6"
                >
                    <p className="text-xs md:text-sm tracking-luxury uppercase text-primary">
                        Quiet Luxury
                    </p>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-parchment leading-none">
                        Timeless<br />
                        <span className="italic">Identity</span>
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                        For the man who lets his presence speak louder than his wardrobe.
                        Crafted silhouettes that embody heritage and restraint.
                    </p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-3 text-xs tracking-luxury uppercase text-foreground hover:text-primary transition-colors duration-300 group mt-4"
                        >
                            <span>Explore Collection</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-px h-10 bg-gradient-to-b from-primary/50 to-transparent" />
            </motion.div>
        </section>
    );
}