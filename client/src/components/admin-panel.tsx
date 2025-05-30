import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Settings, Cookie, ShoppingBag, Star, BarChart3, Edit, Trash2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Product, Order, Review } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { ProductEditor } from "./product-editor";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { admin, isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refetch every 5 seconds to see new orders
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
    enabled: isAuthenticated,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return login(username, password);
    },
    onSuccess: () => {
      setIsLoginMode(false);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return apiRequest("PUT", `/api/reviews/${reviewId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Reseña aprobada",
        description: "La reseña ha sido publicada",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return apiRequest("DELETE", `/api/reviews/${reviewId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Reseña eliminada",
        description: "La reseña ha sido eliminada",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      const statusText = getStatusText(variables.status);
      toast({
        title: "Estado actualizado correctamente",
        description: `El pedido #${variables.orderId} ahora está "${statusText}". Se ha enviado una notificación por correo al cliente.`,
      });
    },
    onError: () => {
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el estado del pedido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    logout();
    setIsLoginMode(true);
    setLoginForm({ username: "", password: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente de pago";
      case "confirmed":
        return "Confirmado";
      case "preparing":
        return "En preparación";
      case "ready":
        return "Listo para entrega";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [
          { value: "confirmed", label: "Confirmar", color: "bg-blue-500" },
          { value: "cancelled", label: "Cancelar", color: "bg-red-500" }
        ];
      case "confirmed":
        return [
          { value: "preparing", label: "Iniciar preparación", color: "bg-purple-500" },
          { value: "cancelled", label: "Cancelar", color: "bg-red-500" }
        ];
      case "preparing":
        return [
          { value: "ready", label: "Marcar como listo", color: "bg-orange-500" },
          { value: "cancelled", label: "Cancelar", color: "bg-red-500" }
        ];
      case "ready":
        return [
          { value: "delivered", label: "Marcar como entregado", color: "bg-green-500" }
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-dark-brown dark:text-white">
            <Settings className="h-5 w-5" />
            <span>Panel Administrativo</span>
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated || isLoginMode ? (
          <div className="max-w-md mx-auto py-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  placeholder="admin"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="admin123"
                />
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full gradient-gold text-dark-brown"
              >
                {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-warm-gray">Bienvenido,</span>
                <span className="font-semibold">{admin?.username}</span>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Cerrar Sesión
              </Button>
            </div>

            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Análisis</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Productos</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Pedidos</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Reseñas</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-4">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <ProductEditor />
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Gestión de Pedidos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold">{product.name}</h5>
                            <p className="text-warm-gray text-sm">
                              Stock: {product.stock} unidades
                            </p>
                            <p className="text-gold font-semibold">${product.price}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <h3 className="text-xl font-semibold">Gestión de Pedidos</h3>
                {ordersLoading && (
                  <div className="text-center py-8">
                    <div className="text-warm-gray">Cargando pedidos...</div>
                  </div>
                )}
                {!ordersLoading && orders.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-warm-gray">No hay pedidos registrados</div>
                  </div>
                )}
                <div className="space-y-4">
                  {orders.map((order) => {
                    const nextStatusOptions = getNextStatusOptions(order.status);
                    const items = JSON.parse(order.items || "[]");
                    
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h5 className="font-semibold text-lg">Pedido #{order.id}</h5>
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                                {order.emailSent && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    📧 Email enviado
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-warm-gray">Cliente</p>
                                  <p className="font-medium">{order.customerName}</p>
                                  <p className="text-sm text-warm-gray">{order.customerEmail}</p>
                                  {order.customerPhone && (
                                    <p className="text-sm text-warm-gray">{order.customerPhone}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-warm-gray">Dirección</p>
                                  <p className="text-sm">{order.address}</p>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-sm text-warm-gray mb-2">Productos:</p>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                  {items.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center py-1">
                                      <span className="text-sm">{item.name} x{item.quantity}</span>
                                      <span className="text-sm font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold">Total:</span>
                                      <span className="font-bold text-gold text-lg">${order.total}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-warm-gray">
                                <span>📅 {new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
                                <span>⭐ Puntos ganados: {order.pointsEarned}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 lg:w-48">
                              {nextStatusOptions.map((option) => (
                                <Button
                                  key={option.value}
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatusMutation.mutate({
                                      orderId: order.id,
                                      status: option.value,
                                    })
                                  }
                                  disabled={updateOrderStatusMutation.isPending}
                                  className={`${option.color} hover:opacity-80 text-white`}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <h3 className="text-xl font-semibold">Gestión de Reseñas</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-semibold">{review.customerName}</h5>
                              <div className="flex">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-gold fill-current" />
                                ))}
                              </div>
                              <Badge
                                className={
                                  review.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {review.isApproved ? "Aprobada" : "Pendiente"}
                              </Badge>
                            </div>
                            <p className="text-warm-gray text-sm mb-2">"{review.comment}"</p>
                            <p className="text-xs text-warm-gray">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {!review.isApproved && (
                              <Button
                                size="sm"
                                onClick={() => approveReviewMutation.mutate(review.id)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                Aprobar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteReviewMutation.mutate(review.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <h3 className="text-xl font-semibold">Análisis y Estadísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Reseñas Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reviews.filter((r) => !r.isApproved).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
