import { Button } from "@/components/ui/button";
import { ShoppingBag, Play } from "lucide-react";

interface HeroSectionProps {
  onOrderClick: () => void;
}

export function HeroSection({ onOrderClick }: HeroSectionProps) {
  const scrollToProducts = () => {
    const productsSection = document.getElementById("productos");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 leading-tight">
            La dulzura{" "}
            <span className="text-gold">programada</span>
            <br />
            para tu antojo
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Galletas artesanales hechas con amor, ingredientes premium y la
            precisión de un código perfecto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onOrderClick}
              className="gradient-gold text-dark-brown px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Hacer Pedido
            </Button>
            <Button
              onClick={scrollToProducts}
              variant="outline"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-dark-brown transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Ver Catálogo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
