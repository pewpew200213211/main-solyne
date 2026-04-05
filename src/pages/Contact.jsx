import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        const msg = `New inquiry from ${form.name} (${form.email}):\n\n${form.message}`;
        window.open(`https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
        toast.success('Opening WhatsApp to send your message');
        setSending(false);
        setForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
                {/* Left - Info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-12"
                >
                    <div>
                        <p className="text-xs tracking-luxury uppercase text-primary mb-4">Get in Touch</p>
                        <h1 className="font-serif text-5xl md:text-6xl font-light text-foreground leading-tight">
                            Private<br />
                            <span className="italic">Consultation</span>
                        </h1>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                        Whether you seek styling guidance, wish to inquire about a specific piece,
                        or desire a private viewing of our collection, we welcome your correspondence.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm border border-border/30 flex items-center justify-center">
                                <MessageCircle size={16} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground tracking-luxury uppercase">WhatsApp</p>
                                <a href="https://wa.me/8801XXXXXXXXX" className="text-sm text-foreground hover:text-primary transition-colors">
                                    +880 1XXX-XXXXXX
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm border border-border/30 flex items-center justify-center">
                                <Mail size={16} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground tracking-luxury uppercase">Email</p>
                                <a href="mailto:hello@solyne.com" className="text-sm text-foreground hover:text-primary transition-colors">
                                    hello@solyne.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm border border-border/30 flex items-center justify-center">
                                <MapPin size={16} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground tracking-luxury uppercase">Atelier</p>
                                <p className="text-sm text-foreground">Dhaka, Bangladesh</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right - Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs tracking-luxury uppercase text-muted-foreground">Name</label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Your full name"
                                required
                                className="bg-transparent border-border/30 focus:border-primary text-foreground placeholder:text-muted-foreground/40 rounded-sm py-6"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs tracking-luxury uppercase text-muted-foreground">Email</label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="Your email address"
                                required
                                className="bg-transparent border-border/30 focus:border-primary text-foreground placeholder:text-muted-foreground/40 rounded-sm py-6"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs tracking-luxury uppercase text-muted-foreground">Message</label>
                            <Textarea
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="How may we assist you?"
                                required
                                rows={6}
                                className="bg-transparent border-border/30 focus:border-primary text-foreground placeholder:text-muted-foreground/40 rounded-sm resize-none"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-luxury uppercase py-6 rounded-sm"
                        >
                            Send Inquiry
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}