import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ productName = null }) {
    const baseMessage = productName
        ? `I am interested in a private consultation regarding the ${productName}.`
        : 'I am interested in learning more about SOLYNÉ.';

    const whatsappUrl = `https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(baseMessage)}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
        >
            <MessageCircle size={24} className="text-primary-foreground" />
        </motion.a>
    );
}