import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartSidebar from '../checkout/CartSidebar';
import { useCart } from '@/lib/CartContext';

export default function AppLayout() {
    const { cart, openCart } = useCart();

    return (
        <div className="min-h-screen bg-obsidian noise-overlay">
            <Navbar cartCount={cart.length} onCartClick={openCart} />
            <main className="relative z-0">
                <Outlet />
            </main>
            <Footer />
            <WhatsAppButton />
            <CartSidebar />
        </div>
    );
}