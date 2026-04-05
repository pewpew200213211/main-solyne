import { supabase } from '@/api/supabase';

export const orderService = {
    async getAllOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (*)
                )
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async updateOrderStatus(orderId, status, deliveryInfo, adminNotes) {
        // Fetch current status for stock logic
        const { data: currentOrder, error: fetchError } = await supabase
            .from('orders').select('status').eq('id', orderId).single();
        if (fetchError) throw fetchError;

        const updateData = { status };
        if (deliveryInfo !== undefined) updateData.delivery_info = deliveryInfo;
        if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
        if (error) throw error;

        // Auto-decrement stock when order transitions to "delivered"
        if (status === 'delivered' && currentOrder.status !== 'delivered') {
            const { data: items } = await supabase
                .from('order_items').select('product_id, quantity').eq('order_id', orderId);

            for (const item of (items || [])) {
                const { data: product } = await supabase
                    .from('products').select('stock').eq('id', item.product_id).single();
                if (product) {
                    await supabase.from('products')
                        .update({ stock: Math.max(0, (product.stock || 0) - item.quantity) })
                        .eq('id', item.product_id);
                }
            }
        }
    },

    async createOrder(orderItems, totalAmount, shippingAddress, contactNumber, paymentMethod, transactionId) {
        // 1. Get current auth user
        const { data: { session } } = await supabase.auth.getSession();
        
        // 2. Create the order row
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: session?.user?.id || null,
                total_amount: totalAmount,
                shipping_address: shippingAddress,
                contact_number: contactNumber,
                payment_method: paymentMethod,
                transaction_id: transactionId,
                status: 'pending'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. Insert order items map order_id
        const itemsToInsert = orderItems.map(item => ({
            ...item,
            order_id: order.id
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        return order;
    }
};
