import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Package, LogOut } from 'lucide-react';

export default function AdminLayout() {
    const { user, isLoadingAuth, logout } = useAuth();
    const location = useLocation();

    if (isLoadingAuth) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-obsidian text-primary">
                <div className="w-8 h-8 border-2 border-brass/20 border-t-brass rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-obsidian text-foreground space-y-6 px-4 text-center">
                <h1 className="text-3xl md:text-5xl font-serif font-light">Admin Access Required</h1>
                <p className="text-foreground/70 max-w-md">You must be authenticated to access the SOLYNÉ administrative dashboard.</p>
                <Link to="/" className="px-6 py-3 border border-border/50 text-xs tracking-luxury uppercase hover:bg-white/5 transition-colors">
                    Return to Storefront
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col">
                <div className="mb-12">
                    <Link to="/" className="font-serif text-2xl tracking-luxury text-foreground block">
                        SOLYNÉ
                    </Link>
                    <span className="text-primary text-[10px] uppercase block tracking-[0.3em] mt-2">Admin Panel</span>
                </div>
                
                <nav className="flex-1 space-y-1">
                    <Link 
                        to="/admin/products" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/products') ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'}`}
                    >
                        <Package size={18} strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-wider">Products</span>
                    </Link>
                </nav>

                <div className="pt-6 border-t border-border mt-auto">
                    <div className="px-4 py-3 mb-2">
                        <p className="text-xs text-foreground/50 truncate tracking-wide">{user.email}</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-foreground/70 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                        <LogOut size={18} strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-wider">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
