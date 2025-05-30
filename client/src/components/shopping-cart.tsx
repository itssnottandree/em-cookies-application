import { X, Minus, Plus, CreditCard, ShoppingCart as CartIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function ShoppingCart({ isOpen, onClose, onCheckout }: ShoppingCartProps) {
  const { items, total, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2 text-dark-brown dark:text-white">
            <CartIcon className="h-5 w-5" />
            <span>Tu Carrito</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CartIcon className="h-16 w-16 text-warm-gray mx-auto mb-4" />
                <p className="text-warm-gray text-lg">Tu carrito está vacío</p>
                <p className="text-sm text-warm-gray mt-2">
                  Agrega algunas galletas deliciosas
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-cream dark:bg-gray-700 rounded-lg"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-dark-brown dark:text-white">
                        {item.name}
                      </h4>
                      <p className="text-warm-gray dark:text-gray-300 text-sm">
                        ${item.price}
                      </p>
                      <div className="flex items-center mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-3 font-semibold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-dark-brown dark:text-white">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-gold">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={onCheckout}
                  className="w-full gradient-gold text-dark-brown py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 mb-3"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceder al Pago
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-2 border-gold text-gold py-3 rounded-lg font-semibold hover:bg-gold hover:text-dark-brown transition-all duration-300"
                >
                  Continuar Comprando
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
