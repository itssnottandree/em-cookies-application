import { 
  users, products, orders, reviews, admins, analytics, loyaltyHistory,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Review, type InsertReview,
  type Admin, type InsertAdmin,
  type Analytics, type InsertAnalytics,
  type LoyaltyHistory, type InsertLoyaltyHistory
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLoyaltyPoints(id: number, points: number): Promise<User | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;

  // Loyalty History
  createLoyaltyHistoryEntry(entry: InsertLoyaltyHistory): Promise<LoyaltyHistory>;
  getUserLoyaltyHistory(userId: number): Promise<LoyaltyHistory[]>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  markOrderEmailSent(id: number): Promise<Order | undefined>;

  // Reviews
  getReviews(): Promise<Review[]>;
  getApprovedReviews(): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: number): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;

  // Admins
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Analytics
  createAnalyticsEvent(event: InsertAnalytics): Promise<Analytics>;
  getAnalyticsSummary(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    recentOrders: Order[];
    topProducts: Array<{ product: Product; orderCount: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
    dailyStats: Array<{ date: string; orders: number; revenue: number }>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private reviews: Map<number, Review>;
  private admins: Map<number, Admin>;
  private analyticsEvents: Map<number, Analytics>;
  private loyaltyHistoryEntries: Map<number, LoyaltyHistory>;
  private currentUserId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentReviewId: number;
  private currentAdminId: number;
  private currentAnalyticsId: number;
  private currentLoyaltyHistoryId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    this.admins = new Map();
    this.analyticsEvents = new Map();
    this.loyaltyHistoryEntries = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentReviewId = 1;
    this.currentAdminId = 1;
    this.currentAnalyticsId = 1;
    this.currentLoyaltyHistoryId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create default admin
    const defaultAdmin: Admin = {
      id: this.currentAdminId++,
      username: "andree@emcookies.com",
      password: "admin123", // In production, this should be hashed
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);

    // Create admin user account for authentication
    const adminUser: User = {
      id: this.currentUserId++,
      name: "Andree Admin",
      email: "andree@emcookies.com",
      passwordHash: "$2b$10$ivIbdTC4OLkVi41qpLTdRuAtJ3qaaFWbm9HHGTE7Tp4NFGFiZA./m", // admin123
      loyaltyPoints: 0,
      createdAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample products
    const sampleProducts: Product[] = [
      {
        id: this.currentProductId++,
        name: "Chocolate Supreme",
        description: "Galletas con chips de chocolate belga y un toque de sal marina",
        price: "12.99",
        category: "chocolate",
        imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 25,
        isActive: true,
      },
      {
        id: this.currentProductId++,
        name: "Vainilla Clásica",
        description: "Tradicionales galletas de vainilla con glaseado artesanal",
        price: "10.99",
        category: "vainilla",
        imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&h=600",
        stock: 30,
        isActive: true,
      },
      {
        id: this.currentProductId++,
        name: "Edición Especial",
        description: "Mix de sabores únicos: lavanda, matcha y frambuesa",
        price: "15.99",
        category: "especiales",
        imageUrl: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&h=600",
        stock: 15,
        isActive: true,
      },
      {
        id: this.currentProductId++,
        name: "Doble Chocolate",
        description: "Intenso sabor a cacao con nueces caramelizadas",
        price: "13.99",
        category: "chocolate",
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&h=600",
        stock: 20,
        isActive: true,
      },
      {
        id: this.currentProductId++,
        name: "Avena & Miel",
        description: "Saludables galletas con avena integral y miel orgánica",
        price: "11.99",
        category: "especiales",
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&h=600",
        stock: 18,
        isActive: true,
      },
      {
        id: this.currentProductId++,
        name: "Mantequilla Premium",
        description: "Delicadas galletas de mantequilla francesa con azúcar glass",
        price: "9.99",
        category: "vainilla",
        imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600",
        stock: 22,
        isActive: true,
      },
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Create sample reviews
    const sampleReviews: Review[] = [
      {
        id: this.currentReviewId++,
        customerName: "María García",
        rating: 5,
        comment: "Las mejores galletas que he probado en mi vida. La textura es perfecta y el sabor increíble. ¡Ya soy cliente frecuente!",
        location: "Madrid, España",
        isApproved: true,
        createdAt: new Date(),
      },
      {
        id: this.currentReviewId++,
        customerName: "Carlos Ruiz",
        rating: 5,
        comment: "Pedí galletas para el cumpleaños de mi hija y todos quedaron encantados. La presentación es hermosa y el sabor excepcional.",
        location: "Barcelona, España",
        isApproved: true,
        createdAt: new Date(),
      },
      {
        id: this.currentReviewId++,
        customerName: "Ana Martínez",
        rating: 5,
        comment: "Como chef, aprecio la calidad de los ingredientes y la técnica. Estas galletas están a nivel profesional.",
        location: "Valencia, España",
        isApproved: true,
        createdAt: new Date(),
      },
    ];

    sampleReviews.forEach(review => {
      this.reviews.set(review.id, review);
    });

    // Create sample orders for demonstration
    const sampleOrders: Order[] = [
      {
        id: this.currentOrderId++,
        userId: null, // Guest order
        customerName: "María García",
        customerEmail: "maria.garcia@example.com",
        customerPhone: "+34 666 123 456",
        address: "Calle Principal 123, Madrid, España",
        items: JSON.stringify([
          { id: 1, name: "Chocolate Supreme", price: "12.99", quantity: 2 },
          { id: 2, name: "Vainilla Clásica", price: "10.99", quantity: 1 }
        ]),
        total: "36.97",
        status: "confirmed",
        pointsEarned: 36,
        emailSent: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: this.currentOrderId++,
        userId: null, // Guest order
        customerName: "Carlos Ruiz",
        customerEmail: "carlos.ruiz@example.com",
        customerPhone: "+34 666 789 123",
        address: "Avenida de la Paz 45, Barcelona, España",
        items: JSON.stringify([
          { id: 3, name: "Edición Especial", price: "15.99", quantity: 1 },
          { id: 4, name: "Doble Chocolate", price: "13.99", quantity: 1 }
        ]),
        total: "29.98",
        status: "preparing",
        pointsEarned: 29,
        emailSent: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        id: this.currentOrderId++,
        userId: null, // Guest order
        customerName: "Ana Martínez",
        customerEmail: "ana.martinez@example.com",
        customerPhone: "+34 666 456 789",
        address: "Plaza del Sol 8, Valencia, España",
        items: JSON.stringify([
          { id: 5, name: "Avena & Miel", price: "11.99", quantity: 3 }
        ]),
        total: "35.97",
        status: "ready",
        pointsEarned: 35,
        emailSent: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      }
    ];

    sampleOrders.forEach(order => {
      this.orders.set(order.id, order);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, loyaltyPoints: 0, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async updateUserLoyaltyPoints(id: number, points: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.loyaltyPoints = points;
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isActive);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category && product.isActive
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      stock: insertProduct.stock ?? 0,
      isActive: insertProduct.isActive ?? true
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { ...product, ...updateData };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    // Calculate points: 1 point per $10 spent
    const pointsEarned = Math.floor(parseFloat(insertOrder.total) / 10);
    const order: Order = { 
      ...insertOrder, 
      id, 
      pointsEarned,
      status: insertOrder.status ?? "pending",
      emailSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: insertOrder.userId ?? null
    };
    this.orders.set(id, order);
    
    // If order is for a registered user, add loyalty points
    if (order.userId && order.status !== 'cancelled') {
      // Update user loyalty points
      const user = this.users.get(order.userId);
      if (user) {
        user.loyaltyPoints += pointsEarned;
        this.users.set(order.userId, user);
        
        // Create loyalty history entry
        const historyId = this.currentLoyaltyHistoryId++;
        const historyEntry: LoyaltyHistory = {
          id: historyId,
          userId: order.userId,
          orderId: order.id,
          points: pointsEarned,
          type: 'earned',
          description: `${pointsEarned} puntos ganados por $${order.total} gastados - Pedido #${order.id}`,
          createdAt: new Date()
        };
        this.loyaltyHistoryEntries.set(historyId, historyEntry);
      }
    }
    
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  async markOrderEmailSent(id: number): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.emailSent = true;
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getApprovedReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = { 
      ...insertReview, 
      id, 
      location: insertReview.location ?? null,
      isApproved: false,
      createdAt: new Date() 
    };
    this.reviews.set(id, review);
    return review;
  }

  async approveReview(id: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (review) {
      review.isApproved = true;
      this.reviews.set(id, review);
      return review;
    }
    return undefined;
  }

  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }

  // Admins
  async getAdmin(id: number): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.currentAdminId++;
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }

  async createAnalyticsEvent(insertEvent: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const event: Analytics = { 
      ...insertEvent, 
      id, 
      timestamp: new Date(),
      metadata: insertEvent.metadata || null,
      userAgent: insertEvent.userAgent || null,
      ipAddress: insertEvent.ipAddress || null
    };
    this.analyticsEvents.set(id, event);
    return event;
  }

  async getAnalyticsSummary(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    recentOrders: Order[];
    topProducts: Array<{ product: Product; orderCount: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
    dailyStats: Array<{ date: string; orders: number; revenue: number }>;
  }> {
    const orders = Array.from(this.orders.values());
    const users = Array.from(this.users.values());
    const products = Array.from(this.products.values());

    // Filter out cancelled orders for revenue and product calculations
    const completedOrders = orders.filter(order => order.status !== 'cancelled');

    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum: number, order) => sum + parseFloat(order.total), 0);
    const totalUsers = users.length;
    const totalProducts = products.length;

    // Recent orders (last 10)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Top products by order count (only from completed orders)
    const productOrderCounts = new Map<number, number>();
    completedOrders.forEach(order => {
      const items = JSON.parse(order.items);
      items.forEach((item: any) => {
        const count = productOrderCounts.get(item.id) || 0;
        productOrderCounts.set(item.id, count + item.quantity);
      });
    });

    const topProducts = Array.from(productOrderCounts.entries())
      .map(([productId, orderCount]) => ({
        product: this.products.get(productId)!,
        orderCount
      }))
      .filter(item => item.product)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    // Orders by status
    const statusCounts = new Map<string, number>();
    orders.forEach(order => {
      const count = statusCounts.get(order.status) || 0;
      statusCounts.set(order.status, count + 1);
    });

    const ordersByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count
    }));

    // Daily stats (last 7 days)
    const dailyStats: Array<{ date: string; orders: number; revenue: number }> = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateString;
      });
      
      // Only count completed orders for daily revenue
      const dayCompletedOrders = dayOrders.filter(order => order.status !== 'cancelled');
      
      dailyStats.push({
        date: dateString,
        orders: dayCompletedOrders.length,
        revenue: dayCompletedOrders.reduce((sum: number, order) => sum + parseFloat(order.total), 0)
      });
    }

    return {
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      topProducts,
      ordersByStatus,
      dailyStats
    };
  }

  // Loyalty History
  async createLoyaltyHistoryEntry(entry: InsertLoyaltyHistory): Promise<LoyaltyHistory> {
    const id = this.currentLoyaltyHistoryId++;
    const historyEntry: LoyaltyHistory = {
      ...entry,
      id,
      orderId: entry.orderId ?? null,
      createdAt: new Date()
    };
    this.loyaltyHistoryEntries.set(id, historyEntry);
    return historyEntry;
  }

  async getUserLoyaltyHistory(userId: number): Promise<LoyaltyHistory[]> {
    return Array.from(this.loyaltyHistoryEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

import { DatabaseStorage } from './database';

export const storage = new DatabaseStorage();
