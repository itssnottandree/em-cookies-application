import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot } from "lucide-react";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente virtual de Dulce Codigo. ¿En qué puedo ayudarte hoy?",
      isBot: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const predefinedResponses: Record<string, string> = {
    "hola": "¡Hola! ¿Cómo puedo ayudarte con nuestras deliciosas galletas?",
    "productos": "Tenemos una gran variedad de galletas artesanales: chocolate, vainilla y ediciones especiales. ¿Te interesa alguna en particular?",
    "precios": "Nuestros precios van desde $9.99 hasta $15.99. ¡Todas nuestras galletas están hechas con ingredientes premium!",
    "envios": "Realizamos envíos a toda España. El tiempo de entrega es de 2-3 días laborables.",
    "ingredientes": "Usamos solo ingredientes naturales y de la más alta calidad: harina orgánica, mantequilla francesa, chocolate belga, y más.",
    "alergenos": "Nuestras galletas pueden contener gluten, frutos secos, huevos y lácteos. Consulta la descripción de cada producto para más detalles.",
    "puntos": "¡Genial que preguntes! Ganas 1 punto por cada euro gastado. Con 100 puntos puedes canjear una galleta gratis.",
    "contacto": "Puedes contactarnos al +34 123 456 789 o por email a info@dulcecodigo.es",
    default: "Gracias por tu pregunta. Para información más específica, puedes contactar con nuestro equipo de atención al cliente. ¿Hay algo más en lo que pueda ayudarte?"
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let botResponse = predefinedResponses.default;

      for (const [key, value] of Object.entries(predefinedResponses)) {
        if (key !== "default" && lowerInput.includes(key)) {
          botResponse = value;
          break;
        }
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isBot: true,
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 gradient-gold rounded-full shadow-lg flex items-center justify-center text-dark-brown hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 h-96 shadow-xl transform transition-all duration-300 origin-bottom-right">
          <CardHeader className="gradient-gold rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-dark-brown" />
                <h4 className="font-semibold text-dark-brown">Asistente Dulce</h4>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-dark-brown hover:bg-yellow-500 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-sm ${
                      message.isBot
                        ? "bg-gray-100 dark:bg-gray-700 text-dark-brown dark:text-white"
                        : "gradient-gold text-dark-brown"
                    }`}
                  >
                    {message.isBot && (
                      <div className="flex items-center space-x-1 mb-1">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-medium">Bot</span>
                      </div>
                    )}
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="gradient-gold text-dark-brown hover:shadow-lg transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
