import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { type SignupData, type LoginData, type User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  static async signup(signupData: SignupData): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(signupData.email);
    if (existingUser) {
      throw new Error('Ya existe una cuenta con este email');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(signupData.password, saltRounds);

    // Create user
    const user = await storage.createUser({
      name: signupData.name,
      email: signupData.email,
      passwordHash
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { user, token };
  }

  static async login(loginData: LoginData): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await storage.getUserByEmail(loginData.email);
    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Check if user is admin and add isAdmin property
    const userWithAdmin = {
      ...user,
      isAdmin: user.email === 'andree@emcookies.com'
    };

    return { user: userWithAdmin, token };
  }

  static async verifyToken(token: string): Promise<{ userId: number; email: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = await this.verifyToken(token);
      const user = await storage.getUser(decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }
}

// Middleware para proteger rutas
export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  AuthService.verifyToken(token)
    .then(decoded => {
      req.user = decoded;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Token inválido' });
    });
}