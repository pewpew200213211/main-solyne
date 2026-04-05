import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STORY_IMAGE = "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/2a1ec6cae_generated_066f8996.png";

export default function OurStoryPreview() {
    return (
        <section className="py-24 md:py-40 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="overflow-hidden rounded-sm">
                        <img
                            src={STORY_IMAGE}
                            alt="SOLYNÉ brand story"
                            className="w-full h-[500px] md:h-[600px] object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 border border-primary/20 rounded-sm hidden lg:block" />
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-8"
                >
                    <p className="text-xs tracking-luxury uppercase text-primary">Our Story</p>
                    <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground leading-tight">
                        Born from<br />
                        <span className="italic">Restraint</span>
                    </h2>
                    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                        <p>
                            SOLYNÉ was conceived not in the pursuit of attention, but in the
                            mastery of its absence. In a world drowning in logos and noise,
                            we chose silence—the kind that commands a room.
                        </p>
                        <p>
                            Every thread, every stitch, every silhouette is a declaration
                            that true luxury needs no announcement. It is felt, not seen.
                            Known, not shown.
                        </p>
                    </div>
                    {/* Brass divider */}
                    <div className="w-16 h-px bg-primary" />
                    <Link
                        to="/about"
                        className="inline-block text-xs tracking-luxury uppercase text-foreground hover:text-primary transition-colors"
                    >
                        Read Full Story →
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}