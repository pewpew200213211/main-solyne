import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';

/**
 * This page is the OAuth callback target.
 * Supabase redirects here after Google sign-in with the token in the URL hash.
 * The Supabase client handles the token automatically — we just wait and redirect.
 */
export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // onAuthStateChange fires when supabase parses the hash token
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                navigate('/shop', { replace: true });
            } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                navigate('/auth', { replace: true });
            }
        });

        // Fallback: check session directly (in case event already fired)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/shop', { replace: true });
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-white/10 border-t-[#b8976a] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/40 text-sm tracking-wider">Authenticating...</p>
            </div>
        </div>
    );
}
