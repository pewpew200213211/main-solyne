import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

export default function ReviewsSection() {
    const { data: reviews = [] } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(6);
            if (error) throw error;
            return data || [];
        },
        initialData: [],
    });

    // Fallback reviews if none in DB
    const displayReviews = reviews.length > 0 ? reviews : [
        { id: '1', customer_name: 'Arhan R.', rating: 5, comment: 'The fabric quality is absolutely unmatched. This is what luxury should feel like—understated and powerful.' },
        { id: '2', customer_name: 'Fahim K.', rating: 5, comment: 'Finally a brand that understands quiet confidence. The fit is impeccable and the attention to detail is remarkable.' },
        { id: '3', customer_name: 'Nabil H.', rating: 5, comment: 'I have worn many premium brands but SOLYNÉ stands apart. The minimalism speaks volumes.' },
    ];

    return (
        <section className="py-24 md:py-40 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 md:mb-24"
            >
                <p className="text-xs tracking-luxury uppercase text-primary mb-4">Testimonials</p>
                <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground">
                    Words of <span className="italic">Distinction</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {displayReviews.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.15 }}
                        className="space-y-6"
                    >
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    className={i < review.rating ? 'fill-primary text-primary' : 'text-border'}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                            "{review.comment}"
                        </p>
                        <div className="w-8 h-px bg-border" />
                        <p className="text-xs tracking-luxury uppercase text-foreground">
                            {review.customer_name}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}