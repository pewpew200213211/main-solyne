import React from 'react';
import { motion } from 'framer-motion';

const galleryImages = [
    { src: "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/490c62bf8_generated_764e76de.png", alt: "Collar detail" },
    { src: "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/08c7a7e25_generated_8ed47cbf.png", alt: "Lifestyle editorial" },
    { src: "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/5ccfce85f_generated_24765f69.png", alt: "Fabric texture" },
    { src: "https://media.base44.com/images/public/69d0e27da28c6aa48752d44d/bcd85ec67_generated_3bff2b9d.png", alt: "Cufflink detail" },
];

export default function InstagramGallery() {
    return (
        <section className="py-24 md:py-40">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 px-6"
            >
                <p className="text-xs tracking-luxury uppercase text-primary mb-4">@solyne</p>
                <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground">
                    The <span className="italic">Journal</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
                {galleryImages.map((image, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`relative aspect-square overflow-hidden group cursor-pointer ${
                            index % 2 === 1 ? 'translate-y-6 md:translate-y-12' : ''
                        }`}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/40 transition-all duration-500 flex items-center justify-center">
                            <span className="text-xs tracking-luxury uppercase text-parchment opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                View
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}