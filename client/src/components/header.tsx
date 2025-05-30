import { useState } from "react";
import { Link } from "wouter";
import { ShoppingCart, Settings, Star, Moon, Sun, User, LogIn, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "./theme-provider";
import { useUserAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserProfile } from "./user-profile";

interface HeaderProps {
  onCartOpen: () => void;
  onAdminOpen: () => void;
}

export function Header({ onCartOpen, onAdminOpen }: HeaderProps) {
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useUserAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="text-2xl">🍪</div>
              <h1 className="font-playfair text-2xl font-bold text-dark-brown dark:text-white">
                E&M Cookies
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="hover:text-gold transition-colors">
              Inicio
            </a>
            <a href="#productos" className="hover:text-gold transition-colors">
              Productos
            </a>
            <a href="#testimonios" className="hover:text-gold transition-colors">
              Testimonios
            </a>
            <a href="#contacto" className="hover:text-gold transition-colors">
              Contacto
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>



            {/* User Authentication */}
            {isAuthenticated ? (
              <>
                {/* Loyalty Points */}
                <div className="hidden md:flex items-center space-x-2 gradient-gold px-3 py-1 rounded-full text-dark-brown text-sm font-medium">
                  <Star className="h-4 w-4" />
                  <span>{user?.loyaltyPoints || 0} pts</span>
                </div>
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onAdminOpen}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Panel</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gold hover:bg-gold/90 text-dark-brown"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartOpen}
              className="relative hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-pastel-pink text-dark-brown min-w-[20px] h-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </header>
  );
}
