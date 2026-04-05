import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('solyne_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('solyne_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, selectedSize = null, selectedColor = null, quantityAdd = 1) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(
                item => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
            );

            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantityAdd;
                return newCart;
            } else {
                return [...prevCart, {
                    ...product,
                    selectedSize,
                    selectedColor,
                    quantity: quantityAdd
                }];
            }
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (id, selectedSize, selectedColor, change) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            });
        });
    };

    const removeFromCart = (id, selectedSize, selectedColor) => {
        setCart(prevCart => prevCart.filter(item => 
            !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
        ));
    };

    const clearCart = () => setCart([]);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            isCartOpen,
            openCart,
            closeCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
