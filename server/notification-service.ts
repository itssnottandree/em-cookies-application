import { Order } from '@shared/schema';

// Email notification log for demonstration
interface EmailLog {
  id: number;
  to: string;
  subject: string;
  type: 'order_confirmation' | 'status_update';
  orderId: number;
  timestamp: Date;
  status: 'sent' | 'failed' | 'pending';
  content: string;
}

class NotificationService {
  private static instance: NotificationService;
  private emailLogs: EmailLog[] = [];
  private currentLogId = 1;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async logOrderConfirmation(order: Order): Promise<boolean> {
    const items = JSON.parse(order.items);
    const content = `
Confirmación de Pedido #${order.id}

Hola ${order.customerName},

Gracias por tu pedido en Dulce Codigo.

Detalles del pedido:
${items.map((item: any) => `- ${item.name} x${item.quantity} - $${(parseFloat(item.price) * item.quantity).toFixed(2)}`).join('\n')}

Total: $${order.total}
Dirección: ${order.address}
Puntos ganados: ${order.pointsEarned}

Estado: Confirmado

¡Nos pondremos en contacto contigo pronto!

Dulce Codigo
`;

    const emailLog: EmailLog = {
      id: this.currentLogId++,
      to: order.customerEmail,
      subject: `Confirmación de Pedido #${order.id} - Dulce Codigo`,
      type: 'order_confirmation',
      orderId: order.id,
      timestamp: new Date(),
      status: 'sent',
      content
    };

    this.emailLogs.push(emailLog);
    
    console.log('\n📧 EMAIL NOTIFICATION SENT:');
    console.log('═══════════════════════════════════════');
    console.log(`To: ${emailLog.to}`);
    console.log(`Subject: ${emailLog.subject}`);
    console.log(`Order ID: ${emailLog.orderId}`);
    console.log(`Timestamp: ${emailLog.timestamp.toLocaleString()}`);
    console.log('\nContent:');
    console.log(emailLog.content);
    console.log('═══════════════════════════════════════\n');

    return true;
  }

  async logStatusUpdate(order: Order, newStatus: string): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      'pending': 'Tu pedido está pendiente de confirmación',
      'confirmed': 'Tu pedido ha sido confirmado y está en preparación',
      'preparing': 'Estamos preparando tu pedido con mucho cariño',
      'ready': 'Tu pedido está listo para entrega',
      'delivered': '¡Tu pedido ha sido entregado! Esperamos que disfrutes nuestras galletas',
      'cancelled': 'Tu pedido ha sido cancelado'
    };

    const content = `
Actualización de Pedido #${order.id}

Hola ${order.customerName},

Te escribimos para informarte sobre una actualización en tu pedido.

Estado actual: ${statusMessages[newStatus] || newStatus}
Total del pedido: $${order.total}

${newStatus === 'cancelled' ? 
  'Lamentamos cualquier inconveniente. Si tienes alguna pregunta, no dudes en contactarnos.' :
  'Te mantendremos informado sobre cualquier cambio adicional en tu pedido.'
}

Dulce Codigo
Email: info@dulcecodigo.es
Teléfono: +34 123 456 789
`;

    const emailLog: EmailLog = {
      id: this.currentLogId++,
      to: order.customerEmail,
      subject: `Actualización de Pedido #${order.id} - Dulce Codigo`,
      type: 'status_update',
      orderId: order.id,
      timestamp: new Date(),
      status: 'sent',
      content
    };

    this.emailLogs.push(emailLog);

    console.log('\n📧 EMAIL NOTIFICATION SENT:');
    console.log('═══════════════════════════════════════');
    console.log(`To: ${emailLog.to}`);
    console.log(`Subject: ${emailLog.subject}`);
    console.log(`Order ID: ${emailLog.orderId}`);
    console.log(`New Status: ${newStatus}`);
    console.log(`Timestamp: ${emailLog.timestamp.toLocaleString()}`);
    console.log('\nContent:');
    console.log(emailLog.content);
    console.log('═══════════════════════════════════════\n');

    return true;
  }

  getEmailLogs(): EmailLog[] {
    return this.emailLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getEmailLogsForOrder(orderId: number): EmailLog[] {
    return this.emailLogs.filter(log => log.orderId === orderId);
  }
}

export const notificationService = NotificationService.getInstance();
export type { EmailLog };