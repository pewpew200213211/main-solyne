import { supabase } from '@/api/supabase';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

export default function PageNotFound({ }) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                return { user, isAuthenticated: !!user };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-obsidian">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-muted-foreground/20 font-serif">404</h1>
                        <div className="h-px w-16 bg-primary/30 mx-auto"></div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-xl font-serif text-foreground">
                            Page Not Found
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The page you seek does not exist within our atelier.
                        </p>
                    </div>

                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-shadow-layer rounded-sm border border-border/20">
                            <p className="text-xs text-muted-foreground">
                                Admin: This page hasn't been implemented yet.
                            </p>
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center px-6 py-3 text-xs tracking-luxury uppercase text-foreground border border-border/30 rounded-sm hover:border-primary hover:text-primary transition-colors duration-300"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}