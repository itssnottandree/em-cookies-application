import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Gift, Crown } from "lucide-react";
import { useUserAuth } from "@/components/auth-provider";

export function LoyaltyProgram() {
  const { user, isAuthenticated } = useUserAuth();

  return (
    <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-brown dark:text-white mb-4">
            Programa de Fidelidad
          </h2>
          <p className="text-xl text-warm-gray dark:text-gray-300 max-w-2xl mx-auto">
            Gana puntos con cada compra y canjéalos por deliciosas recompensas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="h-8 w-8 text-dark-brown" />
            </div>
            <h3 className="font-playfair text-xl font-semibold text-dark-brown dark:text-white mb-2">
              Gana Puntos
            </h3>
            <p className="text-warm-gray dark:text-gray-300">
              1 punto por cada $10 gastados
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-dark-brown" />
            </div>
            <h3 className="font-playfair text-xl font-semibold text-dark-brown dark:text-white mb-2">
              Canjea Recompensas
            </h3>
            <p className="text-warm-gray dark:text-gray-300 mb-2">
              Puedes ahorrar dinero aplicándolos en el total de tu orden
            </p>
            <p className="text-sm text-warm-gray dark:text-gray-400">
              1 punto = $0.50 pesos de descuento
            </p>
          </div>
        </div>

        {/* Current Points Display - Only for authenticated users */}
        {isAuthenticated && user && (
          <div className="max-w-md mx-auto">
            <Card className="gradient-gold rounded-2xl p-8 text-center text-dark-brown">
              <CardContent className="p-0">
                <h3 className="font-playfair text-2xl font-semibold mb-4">
                  Tus Puntos Actuales
                </h3>
                <div className="text-5xl font-bold">{user.loyaltyPoints}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
