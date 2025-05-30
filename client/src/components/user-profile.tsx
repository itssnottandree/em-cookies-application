import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserAuth } from "@/components/auth-provider";
import { User, Star, Package, History, Gift } from "lucide-react";
import { type Order, type LoyaltyHistory } from "@shared/schema";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, logout, token } = useUserAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/profile/orders'],
    enabled: !!token && isOpen,
    queryFn: async () => {
      const response = await fetch('/api/profile/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  // Fetch loyalty history
  const { data: loyaltyHistory = [] } = useQuery<LoyaltyHistory[]>({
    queryKey: ['/api/profile/loyalty-history'],
    enabled: !!token && isOpen,
    queryFn: async () => {
      const response = await fetch('/api/profile/loyalty-history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch loyalty history');
      return response.json();
    }
  });

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!user) return null;

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    "in-preparation": "En preparación",
    "ready-for-delivery": "Listo para entrega",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    "in-preparation": "bg-orange-500",
    "ready-for-delivery": "bg-purple-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="points">Puntos</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Información Personal</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {user.loyaltyPoints} puntos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Miembro desde</label>
                  <p className="text-lg">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mis Pedidos ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aún no tienes pedidos</p>
                    <p className="text-sm">¡Haz tu primer pedido y empieza a ganar puntos!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Pedido #{order.id}</span>
                            <Badge
                              variant="secondary"
                              className={`${statusColors[order.status]} text-white`}
                            >
                              {statusLabels[order.status]}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.total}</p>
                            <p className="text-sm text-gray-500">
                              +{order.pointsEarned} puntos
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
                          <p>{order.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Puntos de Fidelidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 border-b mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <span className="text-3xl font-bold">{user.loyaltyPoints}</span>
                  </div>
                  <p className="text-gray-600">Puntos disponibles (${(user.loyaltyPoints * 0.5).toFixed(2)} de descuento)</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Ganas 1 punto por cada $10 gastados • 1 punto = $0.50 pesos
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historial de Puntos
                  </h4>
                  {loyaltyHistory.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay actividad de puntos aún</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {loyaltyHistory.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between py-2 border-b">
                          <div>
                            <p className="text-sm font-medium">{entry.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className={`font-medium ${
                            entry.type === 'earned' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.type === 'earned' ? '+' : '-'}{entry.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}