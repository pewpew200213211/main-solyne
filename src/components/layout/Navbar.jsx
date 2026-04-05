import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

const SolyneLogo = ({ className = "" }) => (
    <span className={`font-serif font-light tracking-luxury uppercase ${className}`}>
        SOL<span className="text-primary">Y</span>NÉ
    </span>
);

export default function Navbar({ cartCount = 0, onCartClick }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const menuRef = useRef(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setUserMenuOpen(false);
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shop' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled
                        ? 'bg-obsidian/95 backdrop-blur-md border-b border-border/30 py-4'
                        : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Left side: Mobile Menu + Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden text-foreground hover:text-primary transition-colors pr-2"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <Link to="/" className="flex-shrink-0">
                            <SolyneLogo className={`transition-all duration-700 ${scrolled ? 'text-xl' : 'text-2xl'}`} />
                        </Link>
                    </div>

                    {/* Right side: Nav Links + Cart */}
                    <div className="flex items-center gap-8 lg:gap-8">
                        {/* Desktop nav - All links together */}
                        <div className="hidden lg:flex items-center gap-8 lg:gap-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-xs tracking-luxury uppercase transition-colors duration-300 hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-foreground/70'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-5">
                            {/* User Menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => user ? setUserMenuOpen(v => !v) : navigate('/auth')}
                                    className={`text-foreground/70 hover:text-primary transition-colors ${user ? 'text-primary' : ''}`}
                                >
                                    <User size={20} strokeWidth={1.5} />
                                </button>

                                {/* Dropdown — only when logged in */}
                                <AnimatePresence>
                                    {userMenuOpen && user && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-8 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="text-xs text-foreground/50 truncate">{user.email}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground/70 hover:text-primary hover:bg-muted transition-colors border-b border-border"
                                            >
                                                <User size={14} /> Profile & Orders
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground/70 hover:text-red-400 hover:bg-muted transition-colors"
                                            >
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {/* Cart */}
                            <button
                                onClick={onCartClick}
                                className="relative text-foreground/70 hover:text-primary transition-colors"
                            >
                                <ShoppingBag size={20} strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-obsidian/98 backdrop-blur-xl flex flex-col items-center justify-center gap-10"
                    >
                        {navLinks.map((link, i) => (
                            <motion.div
                                key={link.path}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    to={link.path}
                                    className={`font-serif text-3xl tracking-luxury uppercase transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-foreground'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}