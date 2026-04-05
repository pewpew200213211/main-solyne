import React from 'react';
import { motion } from 'framer-motion';

const STORY_IMAGE = "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/2a1ec6cae_generated_066f8996.png";
const COLLECTION_IMAGE = "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/104316499_generated_08711ae5.png";

export default function About() {
    return (
        <div className="min-h-screen pt-32 pb-24">
            {/* Hero */}
            <div className="px-6 md:px-16 lg:px-24 max-w-7xl mx-auto mb-24 md:mb-40">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    <p className="text-xs tracking-luxury uppercase text-primary mb-4">Our Philosophy</p>
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light text-foreground leading-tight">
                        The Art of<br />
                        <span className="italic">Understatement</span>
                    </h1>
                </motion.div>
            </div>

            {/* Full-width image */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="w-full h-[50vh] md:h-[70vh] mb-24 md:mb-40"
            >
                <img
                    src={COLLECTION_IMAGE}
                    alt="SOLYNÉ Collection"
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Story sections */}
            <div className="px-6 md:px-16 lg:px-24 max-w-4xl mx-auto space-y-24 md:space-y-40">
                {/* Origin */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                        The <span className="italic">Beginning</span>
                    </h2>
                    <div className="space-y-6 text-sm text-muted-foreground leading-[1.8]">
                        <p>
                            SOLYNÉ was born from a singular observation: the most powerful men in history
                            never needed to announce their presence. Their tailoring did it for them. In the
                            quiet corridors of old-money estates, in the measured footsteps across marble
                            lobbies, there existed a language of clothing that spoke of heritage, not hype.
                        </p>
                        <p>
                            We founded SOLYNÉ in pursuit of that language. Not the loud proclamations of
                            fast fashion, nor the ostentatious displays of new wealth—but the whispered
                            confidence of a man who knows that true luxury is felt in the hand, not seen
                            from across the room.
                        </p>
                    </div>
                    <div className="w-16 h-px bg-primary" />
                </motion.div>

                {/* Image break */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="overflow-hidden rounded-sm"
                >
                    <img
                        src={STORY_IMAGE}
                        alt="SOLYNÉ craftsmanship"
                        className="w-full h-[400px] md:h-[500px] object-cover"
                    />
                </motion.div>

                {/* Philosophy */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                        The <span className="italic">Philosophy</span>
                    </h2>
                    <div className="space-y-6 text-sm text-muted-foreground leading-[1.8]">
                        <p>
                            Every piece in our collection begins with a question: "Does this need to exist?"
                            We believe in radical restraint. Each seam is intentional. Each colour is considered.
                            Each fabric is sourced not for its label, but for its character—how it falls, how it
                            breathes, how it ages with grace.
                        </p>
                        <p>
                            Our design process rejects trends entirely. We look instead to the permanent things:
                            the proportions of classical architecture, the palette of old European portraiture,
                            the weight of handwritten correspondence. These are the references that inform a
                            SOLYNÉ garment.
                        </p>
                    </div>
                    <div className="w-16 h-px bg-primary" />
                </motion.div>

                {/* Craftsmanship */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                        The <span className="italic">Craft</span>
                    </h2>
                    <div className="space-y-6 text-sm text-muted-foreground leading-[1.8]">
                        <p>
                            We work exclusively with fabrics that earn their place: Egyptian cotton with a
                            thread count that speaks of decades, not seasons. Italian-milled linens that soften
                            with each wear. Japanese selvedge details that only the wearer will ever know about.
                        </p>
                        <p>
                            This is clothing for the man who dresses for himself—not for the room, not for the
                            photograph, not for the moment. SOLYNÉ is for the man who understands that the
                            truest form of luxury is the confidence to be quiet.
                        </p>
                    </div>
                    <div className="w-16 h-px bg-primary" />
                </motion.div>

                {/* Closing statement */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center py-16"
                >
                    <p className="font-serif text-3xl md:text-4xl font-light text-foreground italic leading-relaxed">
                        "Quiet Luxury.<br />Timeless Identity."
                    </p>
                    <div className="w-8 h-px bg-primary mx-auto mt-8" />
                </motion.div>
            </div>
        </div>
    );
}