import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-dark-brown text-cream py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">🍪</div>
              <h3 className="font-playfair text-2xl font-bold">E&M Cookies</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Creando momentos dulces con la precisión de un código perfecto desde 2024.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gold hover:text-yellow-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gold hover:text-yellow-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gold hover:text-yellow-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-gray-300 hover:text-gold transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#productos" className="text-gray-300 hover:text-gold transition-colors">
                  Productos
                </a>
              </li>
              <li>
                <a href="#testimonios" className="text-gray-300 hover:text-gold transition-colors">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-gold transition-colors">
                  Sobre Nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gold" />
                +1 (809) 916-8963
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gold" />
                emcookiesshop@gmail.com
              </p>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gold" />
                Colegio Padre Fortín
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">
              Recibe ofertas especiales y nuevos sabores
            </p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Tu email"
                className="flex-1 rounded-r-none border-0 text-dark-brown"
              />
              <Button className="gradient-gold text-dark-brown rounded-l-none font-semibold">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-warm-gray pt-8 text-center text-gray-300">
          <p>&copy; 2024 E&M Cookies. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
