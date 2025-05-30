import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

const categories = [
  { id: "all", name: "Todas" },
  { id: "chocolate", name: "Chocolate" },
  { id: "vainilla", name: "Vainilla" },
  { id: "especiales", name: "Especiales" },
];

export function ProductCatalog() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products.filter(
    (product) => activeCategory === "all" || product.category === activeCategory
  );

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast({
      title: "¡Producto agregado!",
      description: `${product.name} se agregó a tu carrito`,
    });
  };

  return (
    <section id="productos" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-brown dark:text-white mb-4">
            Nuestras Creaciones
          </h2>
          <p className="text-xl text-warm-gray dark:text-gray-300 max-w-2xl mx-auto">
            Cada galleta es una obra de arte culinaria, elaborada con técnicas
            tradicionales y sabores innovadores
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={
                activeCategory === category.id
                  ? "gradient-gold text-dark-brown px-6 py-3 rounded-full font-medium"
                  : "bg-gray-100 dark:bg-gray-700 text-dark-brown dark:text-white px-6 py-3 rounded-full font-medium hover:bg-light-brown transition-all duration-300"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="card-hover bg-cream dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg">
                  <Skeleton className="w-full h-64" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="card-hover bg-cream dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <CardContent className="p-6">
                    <h3 className="font-playfair text-xl font-semibold mb-2 text-dark-brown dark:text-white">
                      {product.name}
                    </h3>
                    <p className="text-warm-gray dark:text-gray-300 mb-4">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gold">
                        ${product.price}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="gradient-gold text-dark-brown px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
}
