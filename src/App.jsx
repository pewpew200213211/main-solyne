import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { CartProvider } from '@/lib/CartContext';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';
import PageNotFound from './lib/PageNotFound';

import AdminDashboard from './pages/admin/AdminDashboard';

const AppRoutes = () => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-8 h-8 border-2 border-white/10 border-t-[#b8976a] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth" element={<Auth />} />

            {/* Admin — self-contained layout, no AppLayout wrapper */}
            <Route path="/admin/*" element={<AdminDashboard />} />

            {/* Public */}
            <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <QueryClientProvider client={queryClientInstance}>
                    <Router>
                        <AppRoutes />
                    </Router>
                    <Toaster />
                </QueryClientProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;