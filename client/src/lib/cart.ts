import { Product } from "@shared/schema";

export interface CartItem extends Product {
  quantity: number;
}

export class CartManager {
  private static instance: CartManager;
  private items: CartItem[] = [];
  private listeners: (() => void)[] = [];

  static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }
    return CartManager.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch {
      this.items = [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem("cart", JSON.stringify(this.items));
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  addListener(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  addItem(product: Product, quantity: number = 1): void {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    
    this.saveToStorage();
  }

  removeItem(productId: number): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveToStorage();
    }
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotal(): number {
    return this.items.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  }

  clear(): void {
    this.items = [];
    this.saveToStorage();
  }
}

export const cartManager = CartManager.getInstance();
