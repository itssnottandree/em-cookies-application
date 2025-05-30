import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import type { IStorage } from './storage';
import type { 
  User, InsertUser, 
  Product, InsertProduct,
  Order, InsertOrder,
  Review, InsertReview,
  Admin, InsertAdmin,
  Analytics, InsertAnalytics,
  LoyaltyHistory, InsertLoyaltyHistory
} from '../shared/schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const sql_client = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
export const db = drizzle(sql_client, { schema });

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // First, ensure tables exist
      await this.createTablesIfNotExist();
      
      // Check if sample products exist
      const existingProducts = await db.select().from(schema.products).limit(1);
      if (existingProducts.length === 0) {
        // Insert sample products
        await db.insert(schema.products).values([
          {
            name: "Chocolate Supreme",
            description: "Galletas de chocolate con chips extra grandes y nueces. Una experiencia premium que derrite en tu boca.",
            price: "2.50",
            category: "Chocolate",
            imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
            stock: 50
          },
          {
            name: "Vainilla Clásica",
            description: "Nuestras tradicionales galletas de vainilla con un toque de canela. Perfectas para acompañar tu café.",
            price: "2.00",
            category: "Vainilla",
            imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            stock: 40
          },
          {
            name: "Avena y Pasas",
            description: "Galletas caseras de avena con pasas dulces. Una opción saludable y deliciosa para cualquier momento.",
            price: "2.25",
            category: "Avena",
            imageUrl: "https://images.unsplash.com/photo-1568051243858-533a607809a5?w=400",
            stock: 35
          }
        ]);

        // Insert sample reviews
        await db.insert(schema.reviews).values([
          {
            customerName: "María García",
            rating: 5,
            comment: "¡Increíbles! Las mejores galletas que he probado en mucho tiempo."
          },
          {
            customerName: "José Rodríguez",
            rating: 5,
            comment: "Excelente calidad y sabor. Muy recomendadas."
          }
        ]);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private async createTablesIfNotExist() {
    try {
      console.log('Creating tables if they do not exist...');
      
      // Create tables using raw SQL
      await sql_client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          loyalty_points INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sql_client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          image_url TEXT NOT NULL,
          stock INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true
        );
      `);

      await sql_client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          address TEXT NOT NULL,
          items TEXT NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          points_earned INTEGER DEFAULT 0,
          email_sent BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sql_client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          customer_name VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL,
          location TEXT,
          is_approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sql_client.query(`
       CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sql_client.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(100) NOT NULL,
          metadata TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_agent TEXT,
          ip_address TEXT
        );
      `);

      await sql_client.query(`
        CREATE TABLE IF NOT EXISTS loyalty_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          order_id INTEGER REFERENCES orders(id),
          points INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Tables created successfully!');
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values({
      ...insertUser,
      loyaltyPoints: 0
    }).returning();
    return result[0];
  }

  async updateUserLoyaltyPoints(id: number, points: number): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ loyaltyPoints: points })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const result = await db.select().from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(desc(schema.orders.createdAt));
    return result;
  }

  // Loyalty History
  async createLoyaltyHistoryEntry(entry: InsertLoyaltyHistory): Promise<LoyaltyHistory> {
    const result = await db.insert(schema.loyaltyHistory).values(entry).returning();
    return result[0];
  }

  async getUserLoyaltyHistory(userId: number): Promise<LoyaltyHistory[]> {
    const result = await db.select().from(schema.loyaltyHistory)
      .where(eq(schema.loyaltyHistory.userId, userId))
      .orderBy(desc(schema.loyaltyHistory.createdAt));
    return result;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const result = await db.select().from(schema.products)
      .where(eq(schema.products.isActive, true));
    return result;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);
    return result[0];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const result = await db.select().from(schema.products)
      .where(and(
        eq(schema.products.category, category),
        eq(schema.products.isActive, true)
      ));
    return result;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values({
      ...insertProduct,
      isActive: true
    }).returning();
    return result[0];
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(schema.products)
      .set(updateData)
      .where(eq(schema.products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.update(schema.products)
      .set({ isActive: false })
      .where(eq(schema.products.id, id));
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const result = await db.select().from(schema.orders)
      .orderBy(desc(schema.orders.createdAt));
    return result;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);
    return result[0];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    // Calculate points: 1 point per $10 spent
    const pointsEarned = Math.floor(parseFloat(insertOrder.total) / 10);
    
    const result = await db.insert(schema.orders).values({
      ...insertOrder,
      pointsEarned,
      status: insertOrder.status ?? "pending",
      emailSent: false,
      userId: insertOrder.userId ?? null
    }).returning();
    
    const order = result[0];
    
    // If order is for a registered user, add loyalty points
    if (order.userId && order.status !== 'cancelled') {
      // Update user loyalty points
      const user = await this.getUser(order.userId);
      if (user) {
        await this.updateUserLoyaltyPoints(order.userId, user.loyaltyPoints + pointsEarned);
        
        // Create loyalty history entry
        await this.createLoyaltyHistoryEntry({
          userId: order.userId,
          orderId: order.id,
          points: pointsEarned,
          type: 'earned',
          description: `${pointsEarned} puntos ganados por $${order.total} gastados - Pedido #${order.id}`
        });
      }
    }
    
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db.update(schema.orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.orders.id, id))
      .returning();
    return result[0];
  }

  async markOrderEmailSent(id: number): Promise<Order | undefined> {
    const result = await db.update(schema.orders)
      .set({ emailSent: true })
      .where(eq(schema.orders.id, id))
      .returning();
    return result[0];
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    const result = await db.select().from(schema.reviews)
      .orderBy(desc(schema.reviews.createdAt));
    return result;
  }

  async getApprovedReviews(): Promise<Review[]> {
    const result = await db.select().from(schema.reviews)
      .where(eq(schema.reviews.isApproved, true))
      .orderBy(desc(schema.reviews.createdAt));
    return result;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const result = await db.select().from(schema.reviews)
      .where(eq(schema.reviews.id, id))
      .limit(1);
    return result[0];
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const result = await db.insert(schema.reviews).values({
      ...insertReview,
      isApproved: false
    }).returning();
    return result[0];
  }

  async approveReview(id: number): Promise<Review | undefined> {
    const result = await db.update(schema.reviews)
      .set({ isApproved: true })
      .where(eq(schema.reviews.id, id))
      .returning();
    return result[0];
  }

  async deleteReview(id: number): Promise<boolean> {
    await db.delete(schema.reviews)
      .where(eq(schema.reviews.id, id));
    return true;
  }

  // Admins
  async getAdmin(id: number): Promise<Admin | undefined> {
    const result = await db.select().from(schema.admins)
      .where(eq(schema.admins.id, id))
      .limit(1);
    return result[0];
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const result = await db.select().from(schema.admins)
      .where(eq(schema.admins.username, username))
      .limit(1);
    return result[0];
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(schema.admins).values(insertAdmin).returning();
    return result[0];
  }

  // Analytics
  async createAnalyticsEvent(insertEvent: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(schema.analytics).values(insertEvent).returning();
    return result[0];
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
    const [
      ordersResult,
      usersResult,
      productsResult,
      recentOrdersResult
    ] = await Promise.all([
      db.select({
        count: sql<number>`count(*)`,
        total: sql<number>`sum(cast(total as decimal))`
      }).from(schema.orders),
      db.select({
        count: sql<number>`count(*)`
      }).from(schema.users),
      db.select({
        count: sql<number>`count(*)`
      }).from(schema.products).where(eq(schema.products.isActive, true)),
      db.select().from(schema.orders)
        .orderBy(desc(schema.orders.createdAt))
        .limit(10)
    ]);

    const totalOrders = ordersResult[0]?.count || 0;
    const totalRevenue = ordersResult[0]?.total || 0;
    const totalUsers = usersResult[0]?.count || 0;
    const totalProducts = productsResult[0]?.count || 0;

    // For simplicity, returning basic data structure
    // You can enhance these queries as needed
    return {
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders: recentOrdersResult,
      topProducts: [],
      ordersByStatus: [],
      dailyStats: []
    };
  }
}
