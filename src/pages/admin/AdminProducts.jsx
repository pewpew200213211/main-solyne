import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminProducts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast({ title: 'Product deleted', description: 'The product has been successfully removed.' });
        },
        onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-foreground font-light">Products Dashboard</h1>
                    <p className="text-foreground/50 text-sm mt-2">Manage your inventory, pricing, and visibility.</p>
                </div>
                <Link to="/admin/products/new" className="px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-luxury rounded-sm hover:bg-primary/90 transition-colors">
                    Add Product
                </Link>
            </div>
            
            <div className="bg-obsidian border border-[#1a1a1a] rounded-lg">
                {isLoading ? (
                    <div className="p-10 text-center text-foreground/50 animate-pulse">Loading products...</div>
                ) : products?.length === 0 ? (
                    <div className="p-16 text-center text-foreground/50">No products found. Create one.</div>
                ) : (
                    <Table>
                        <TableHeader className="bg-[#111]">
                            <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products?.map((product) => (
                                <TableRow key={product.id} className="border-[#1a1a1a] hover:bg-white/5">
                                    <TableCell>
                                        <div className="w-12 h-16 bg-[#1a1a1a] overflow-hidden rounded-sm">
                                            {product.images && product.images[0] && (
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                                    <TableCell className="text-foreground/70 capitalize">{product.category}</TableCell>
                                    <TableCell className="text-right text-foreground">${product.price}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/admin/products/${product.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-primary">
                                                    <Edit size={16} />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-foreground/70 hover:text-red-400"
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                                        deleteMutation.mutate(product.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
