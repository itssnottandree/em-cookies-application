import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "./email-service";
import { notificationService } from "./notification-service";
import { AuthService, authMiddleware } from "./auth-service";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertReviewSchema,
  insertAdminSchema,
  signupSchema,
  loginSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const { user, token } = await AuthService.signup(validatedData);
      
      // Don't send password hash to client
      const { passwordHash, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        user: userWithoutPassword, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: error.message || "Error creating account" 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { user, token } = await AuthService.login(validatedData);
      
      // Don't send password hash to client
      const { passwordHash, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        user: userWithoutPassword, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: error.message || "Login failed" 
      });
    }
  });

  // Protected user routes
  app.get("/api/profile", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user is admin by email
      const isAdmin = user.email === 'andree@emcookies.com';
      
      // Don't send password hash to client
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, isAdmin });
    } catch (error) {
      res.status(500).json({ error: "Error fetching profile" });
    }
  });

  app.get("/api/profile/orders", authMiddleware, async (req: any, res) => {
    try {
      const orders = await storage.getUserOrders(req.user.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user orders" });
    }
  });

  app.get("/api/profile/loyalty-history", authMiddleware, async (req: any, res) => {
    try {
      const history = await storage.getUserLoyaltyHistory(req.user.userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Error fetching loyalty history" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      // Check if user is authenticated
      let userId = null;
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = await AuthService.verifyToken(token);
          userId = decoded.userId;
        } catch (error) {
          // Token is invalid but we still allow guest orders
          console.log("Invalid token for order, proceeding as guest");
        }
      }

      const validatedData = insertOrderSchema.parse(req.body);
      const orderData = { ...validatedData, userId };
      const order = await storage.createOrder(orderData);
      
      // Send confirmation email (try SendGrid first, then fallback to notification service)
      try {
        const emailSent = await sendOrderConfirmation(order);
        if (emailSent) {
          await storage.markOrderEmailSent(order.id);
        }
      } catch (emailError) {
        console.error("SendGrid email failed, using notification service:", emailError);
        // Fallback to notification service
        await notificationService.logOrderConfirmation(order);
      }
      
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send status update email (try SendGrid first, then fallback to notification service)
      try {
        await sendOrderStatusUpdate(order, status);
      } catch (emailError) {
        console.error("SendGrid email failed, using notification service:", emailError);
        // Fallback to notification service
        await notificationService.logStatusUpdate(order, status);
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  // Reviews routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const { approved } = req.query;
      let reviews;
      
      if (approved === 'true') {
        reviews = await storage.getApprovedReviews();
      } else {
        reviews = await storage.getReviews();
      }
      
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.put("/api/reviews/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const review = await storage.approveReview(id);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Error approving review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteReview(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting review" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use JWT or sessions
      res.json({ 
        success: true, 
        admin: { id: admin.id, username: admin.username } 
      });
    } catch (error) {
      res.status(500).json({ message: "Authentication error" });
    }
  });

  // Get analytics summary
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalyticsSummary();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
