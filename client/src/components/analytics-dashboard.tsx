import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, ShoppingBag, Package, DollarSign, Eye, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: string;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    product: {
      id: number;
      name: string;
      price: string;
    };
    orderCount: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  "in-preparation": "bg-orange-500",
  "ready-for-delivery": "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  "in-preparation": "En preparación",
  "ready-for-delivery": "Listo para entrega",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const totalOrdersThisWeek = analytics.dailyStats.reduce((sum, day) => sum + day.orders, 0);
  const totalRevenueThisWeek = analytics.dailyStats.reduce((sum, day) => sum + day.revenue, 0);
  const avgOrderValue = analytics.totalRevenue / analytics.totalOrders || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalOrdersThisWeek} esta semana
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-3xl font-bold text-green-600">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${totalRevenueThisWeek.toFixed(2)} esta semana
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Registrados</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor promedio: ${avgOrderValue.toFixed(2)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productos Activos</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.totalProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  En catálogo
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estado de Pedidos
            </CardTitle>
            <CardDescription>
              Distribución actual de pedidos por estado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.ordersByStatus.map((status) => (
              <div key={status.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status.status] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium">
                      {statusLabels[status.status] || status.status}
                    </span>
                  </div>
                  <Badge variant="secondary">{status.count}</Badge>
                </div>
                <Progress 
                  value={(status.count / analytics.totalOrders) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>
              Los 5 productos con más pedidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topProducts.map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">${item.product.price}</p>
                  </div>
                </div>
                <Badge variant="outline">{item.orderCount} vendidos</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Pedidos Recientes
          </CardTitle>
          <CardDescription>
            Los últimos 10 pedidos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">#{order.id} - {order.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${parseFloat(order.total).toFixed(2)}</p>
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[order.status] || 'bg-gray-500'} text-white`}
                  >
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Rendimiento Semanal
          </CardTitle>
          <CardDescription>
            Estadísticas de los últimos 7 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.dailyStats.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">
                    {new Date(day.date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{day.orders} pedidos</p>
                  <p className="text-sm text-green-600">${day.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}