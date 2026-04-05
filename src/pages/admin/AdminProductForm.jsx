import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEdit = Boolean(id);

    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        fabric_details: '',
        images: '',
        sizes_available: 'S, M, L, XL'
    });

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
            if (error) throw error;
            
            setFormData({
                name: data.name || '',
                price: data.price || '',
                category: data.category || '',
                description: data.description || '',
                fabric_details: data.fabric_details || '',
                images: data.images ? data.images.join(', ') : '',
                sizes_available: data.sizes_available ? data.sizes_available.join(', ') : ''
            });
        } catch (error) {
            toast({ title: 'Error fetching product', description: error.message, variant: 'destructive' });
            navigate('/admin/products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Process data
        const processedData = {
            name: formData.name,
            price: parseFloat(formData.price) || 0,
            category: formData.category,
            description: formData.description,
            fabric_details: formData.fabric_details,
            images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
            sizes_available: formData.sizes_available.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            if (isEdit) {
                const { error } = await supabase.from('products').update(processedData).eq('id', id);
                if (error) throw error;
                toast({ title: 'Success', description: 'Product updated successfully.' });
            } else {
                const { error } = await supabase.from('products').insert([processedData]);
                if (error) throw error;
                toast({ title: 'Success', description: 'Product created successfully.' });
            }
            navigate('/admin/products');
        } catch (error) {
            toast({ title: 'Saving failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center animate-pulse">Loading product editor...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-10">
                <Link to="/admin/products" className="text-primary text-xs uppercase tracking-wider hover:underline mb-4 inline-block">
                    &larr; Back to Products
                </Link>
                <h1 className="text-3xl font-serif text-foreground font-light">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            </div>

            <div className="bg-obsidian border border-[#1a1a1a] rounded-lg p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-foreground/70">Product Name</label>
                            <input 
                                required
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange}
                                className="w-full bg-[#111] border border-[#222] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-foreground/70">Price (BDT)</label>
                            <input 
                                required
                                type="number" 
                                name="price" 
                                value={formData.price} 
                                onChange={handleChange}
                                className="w-full bg-[#111] border border-[#222] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-foreground/70">Category</label>
                        <input 
                            required
                            type="text" 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange}
                            placeholder="e.g. signature-edition"
                            className="w-full bg-[#111] border border-[#222] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-foreground/70">Description</label>
                        <textarea 
                            required
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-[#111] border border-[#222] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-foreground/70">Fabric Details</label>
                        <textarea 
                            name="fabric_details" 
                            value={formData.fabric_details} 
                            onChange={handleChange}
                            rows={2}
                            placeholder="e.g. 100% Egyptian Cotton"
                            className="w-full bg-[#111] border border-[#222] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-foreground/70">Sizes (comma separated)</label>
                        <input 
                            type="text" 
                            name="sizes_available" 
                            value={formData.sizes_available} 
                            onChange={handleChange}
                            placeholder="S, M, L, XL"
                            className="w-full bg-[#111] border border-[#222] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-foreground/70">Image URLs (comma separated)</label>
                        <textarea 
                            name="images" 
                            value={formData.images} 
                            onChange={handleChange}
                            rows={3}
                            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                            className="w-full bg-[#111] border border-[#222] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                    </div>

                    <div className="pt-6 border-t border-[#1a1a1a] flex justify-end gap-4">
                        <Link to="/admin/products" className="px-6 py-3 border border-border/50 text-xs uppercase tracking-wider rounded-sm hover:bg-white/5 transition-colors">
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
