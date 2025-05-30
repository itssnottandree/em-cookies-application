import { useState } from "react";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ProductCatalog } from "@/components/product-catalog";
import { TestimonialsSection } from "@/components/testimonials-section";
import { LoyaltyProgram } from "@/components/loyalty-program";
import { Footer } from "@/components/footer";
import { ShoppingCart } from "@/components/shopping-cart";
import { AdminPanel } from "@/components/admin-panel";
import { ChatBot } from "@/components/chatbot";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/components/auth-provider";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "Colegio Padre Fortín",
  });
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showOrderAnimation, setShowOrderAnimation] = useState(false);

  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const { user, token, isAuthenticated } = useUserAuth();

  const orderMutation = useMutation({
    mutationFn: async (orderData: typeof orderForm) => {
      const orderItems = JSON.stringify(items);
      const finalTotal = total - (pointsToUse * 0.5);
      
      // Include auth headers if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...orderData,
          items: orderItems,
          total: finalTotal.toString(),
          pointsUsed: pointsToUse,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return response.json();
    },
    onSuccess: (orderData) => {
      // Show animation immediately
      setShowOrderAnimation(true);
      clearCart();
      setIsCheckoutOpen(false);
      
      // Hide animation after 6 seconds
      setTimeout(() => {
        setShowOrderAnimation(false);
        setOrderForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          address: "Colegio Padre Fortín",
        });
      }, 6000);
    },
    onError: () => {
      toast({
        title: "Error al procesar el pedido",
        description: "No se pudo procesar tu pedido. Por favor inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.customerName || !orderForm.customerEmail) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Tu carrito está vacío",
        variant: "destructive",
      });
      return;
    }
    orderMutation.mutate(orderForm);
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById("productos");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderClick = () => {
    if (items.length === 0) {
      scrollToProducts();
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    
    // Pre-fill form with user data if authenticated
    if (isAuthenticated && user) {
      setOrderForm(prevForm => ({
        ...prevForm,
        customerName: user.name,
        customerEmail: user.email,
      }));
    }
    
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900 text-dark-brown dark:text-gray-100">
      <Header 
        onCartOpen={() => setIsCartOpen(true)}
        onAdminOpen={() => setIsAdminOpen(true)}
      />
      <HeroSection onOrderClick={handleOrderClick} />
      <ProductCatalog />
      <TestimonialsSection />
      <LoyaltyProgram />
      <Footer />
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
      <ChatBot />
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-sans">
          <DialogHeader>
            <DialogTitle className="font-sans text-xl font-semibold">Finalizar Pedido</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="space-y-4 font-sans">
              <h3 className="text-lg font-medium">Resumen del Pedido</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-cream dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium font-sans">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-sans">
                          ${item.price} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium font-sans">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Pricing Breakdown */}
              <div className="space-y-2 font-sans">
                <div className="flex justify-between">
                  <span className="font-sans">Subtotal:</span>
                  <span className="font-sans">${total.toFixed(2)}</span>
                </div>
                
                {/* Loyalty Points Section */}
                {isAuthenticated && user && user.loyaltyPoints > 0 && (
                  <div className="space-y-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Puntos disponibles:</span>
                      <Badge variant="secondary">{user.loyaltyPoints} pts</Badge>
                    </div>
                    <div>
                      <Label htmlFor="pointsToUse" className="text-sm">
                        Usar puntos (1 punto = $0.50):
                      </Label>
                      <Input
                        id="pointsToUse"
                        type="number"
                        min="0"
                        max={Math.min(user.loyaltyPoints, Math.floor(total / 0.5))}
                        value={pointsToUse}
                        onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    {pointsToUse > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Descuento por puntos:</span>
                        <span>-${(pointsToUse * 0.5).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold font-sans">
                  <span className="font-sans">Total:</span>
                  <span className="text-gold font-sans">
                    ${(total - (pointsToUse * 0.5)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info Form */}
            <form onSubmit={handleOrderSubmit} className="space-y-4 font-sans">
              <h3 className="text-lg font-medium font-sans">Información del Cliente</h3>
              
              <div>
                <Label htmlFor="customerName">Nombre completo *</Label>
                <Input
                  id="customerName"
                  type="text"
                  value={orderForm.customerName}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerName: e.target.value })
                  }
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={orderForm.customerEmail}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerEmail: e.target.value })
                  }
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Teléfono</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={orderForm.customerPhone}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerPhone: e.target.value })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="address">Dirección de entrega</Label>
                <Input
                  id="address"
                  value="Colegio Padre Fortín"
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Entregamos únicamente en el Colegio Padre Fortín
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={orderMutation.isPending}
                className="w-full gradient-gold text-dark-brown mt-6"
                size="lg"
              >
                {orderMutation.isPending ? "Procesando..." : "Confirmar Pedido"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Order Success Animation */}
      {showOrderAnimation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 max-w-md mx-4 text-center shadow-2xl animate-fade-in-up">
            {/* Cookie falling animation */}
            <div className="relative h-48 mb-8 overflow-hidden">
              {/* Production conveyor belt */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-3 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full shadow-inner"></div>
              
              {/* Animated cookie */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className="text-6xl animate-cookie-fall">🍪</div>
              </div>
              
              {/* Bag at bottom */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bag-shake">
                <div className="text-5xl">🛍️</div>
              </div>
              
              {/* Production sparkles */}
              <div className="absolute top-4 left-1/3 text-yellow-400 text-xl animate-ping">✨</div>
              <div className="absolute top-6 right-1/3 text-yellow-300 text-lg animate-pulse">✨</div>
            </div>
            
            {/* Success message */}
            <h2 className="font-sans text-2xl font-medium text-gray-900 dark:text-white mb-4 animate-fade-in-up">
              ¡Gracias por tu orden!
            </h2>
            <p className="font-sans text-gray-600 dark:text-gray-300 animate-fade-in-up text-[18px] font-normal">
              ¡Tu orden está en manos de nuestros pasteleros! Revisa tu correo electrónico para seguir tu orden en tiempo real!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
