import { useState, useEffect } from "react";
import { cartManager, CartItem } from "@/lib/cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      setItems(cartManager.getItems());
      setItemCount(cartManager.getItemCount());
      setTotal(cartManager.getTotal());
    };

    updateCart();
    
    const unsubscribe = cartManager.addListener(updateCart);
    return unsubscribe;
  }, []);

  const addItem = (product: any, quantity: number = 1) => {
    cartManager.addItem(product, quantity);
  };

  const removeItem = (productId: number) => {
    cartManager.removeItem(productId);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    cartManager.updateQuantity(productId, quantity);
  };

  const clearCart = () => {
    cartManager.clear();
  };

  return {
    items,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
