import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create()(
    persist(
        (set, get) => ({
            cart: [],

            addItem: (product, quantity = 1, selectedVariant = null) => {
                const { cart } = get();

                // Use a unique ID based on product ID and variant ID (if any)
                const cartItemId = selectedVariant
                    ? `${product._id}-${selectedVariant._id}`
                    : product._id;

                const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

                if (existingItemIndex > -1) {
                    const updatedCart = [...cart];
                    updatedCart[existingItemIndex].quantity += quantity;
                    set({ cart: updatedCart });
                } else {
                    const newItem = {
                        cartItemId,
                        id: product._id,
                        name: selectedVariant?.product_name || product.product_name || product.name || 'Unknown Product',
                        price: Number(selectedVariant?.selling_price || product.selling_price || product.price || product.minPrice || 0),
                        mrp: Number(selectedVariant?.mrp_price || product.mrp_price || product.mrp || 0),
                        quantity,
                        image: selectedVariant?.variant_images?.[0] || product.product_images?.[0] || '/Icons/arcmatlogo.svg',
                        color: selectedVariant?.color || null,
                        size: selectedVariant?.size || null,
                        variantId: selectedVariant?._id || null,
                    };
                    set({ cart: [...cart, newItem] });
                }
            },

            removeItem: (cartItemId) => {
                const { cart } = get();
                set({ cart: cart.filter(item => item.cartItemId !== cartItemId) });
            },

            updateQuantity: (cartItemId, quantity) => {
                if (quantity < 1) return;
                const { cart } = get();
                set({
                    cart: cart.map(item =>
                        item.cartItemId === cartItemId ? { ...item, quantity } : item
                    )
                });
            },

            clearCart: () => set({ cart: [] }),

            getTotalItems: () => {
                const { cart } = get();
                return cart.reduce((total, item) => total + item.quantity, 0);
            },

            getSubtotal: () => {
                const { cart } = get();
                return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'arcmat-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
