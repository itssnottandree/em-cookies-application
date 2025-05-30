import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function TestimonialsSection() {
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    location: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews?approved=true"],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: typeof formData) => {
      return apiRequest("POST", "/api/reviews", reviewData);
    },
    onSuccess: () => {
      toast({
        title: "¡Reseña enviada!",
        description: "Tu reseña será revisada y publicada pronto",
      });
      setFormData({
        customerName: "",
        rating: 5,
        comment: "",
        location: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la reseña. Inténtalo de nuevo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.comment) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate(formData);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? "text-gold fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section id="testimonios" className="py-20 gradient-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-brown mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-warm-gray max-w-2xl mx-auto">
            Cada reseña es un testimonio de nuestra pasión por crear momentos dulces
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-white rounded-2xl p-8 shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-gold text-xl">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-warm-gray mb-6 italic">"{review.comment}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-light-brown rounded-full flex items-center justify-center mr-4">
                    <span className="text-dark-brown font-semibold">
                      {review.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-brown">
                      {review.customerName}
                    </h4>
                    {review.location && (
                      <p className="text-sm text-warm-gray">{review.location}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Review Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white rounded-2xl p-8 shadow-lg">
            <CardContent className="p-0">
              <h3 className="font-playfair text-2xl font-semibold text-dark-brown mb-6 text-center">
                Comparte tu experiencia
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="w-full"
                    required
                  />
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rating: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 estrellas</SelectItem>
                      <SelectItem value="4">4 estrellas</SelectItem>
                      <SelectItem value="3">3 estrellas</SelectItem>
                      <SelectItem value="2">2 estrellas</SelectItem>
                      <SelectItem value="1">1 estrella</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="text"
                  placeholder="Tu ubicación (opcional)"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Cuéntanos tu experiencia..."
                  rows={4}
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  required
                />
                <Button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="w-full gradient-gold text-dark-brown py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitReviewMutation.isPending ? "Enviando..." : "Enviar Reseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
