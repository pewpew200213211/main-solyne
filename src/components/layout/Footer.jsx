import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-obsidian border-t border-border/20 py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                    {/* Brand */}
                    <div>
                        <h3 className="font-serif text-2xl tracking-luxury text-foreground mb-4">
                            SOL<span className="text-primary">Y</span>NÉ
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Quiet luxury for the modern gentleman. Crafted with intention, worn with purpose.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-xs tracking-luxury uppercase text-primary mb-6">Navigate</h4>
                        <div className="flex flex-col gap-3">
                            {['Home', 'Shop', 'About', 'Contact'].map((item) => (
                                <Link
                                    key={item}
                                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs tracking-luxury uppercase text-primary mb-6">Connect</h4>
                        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                            <a href="mailto:hello@solyne.com" className="hover:text-foreground transition-colors">
                                hello@solyne.com
                            </a>
                            <a href="https://wa.me/8801XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                                WhatsApp
                            </a>
                            <a href="https://instagram.com/solyne" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                                Instagram
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

                {/* Bottom */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>© {new Date().getFullYear()} SOLYNÉ. All rights reserved.</span>
                    <span className="tracking-luxury uppercase">Quiet Luxury. Timeless Identity.</span>
                </div>
            </div>
        </footer>
    );
}