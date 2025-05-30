import { MailService } from '@sendgrid/mail';
import { Order } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates
const ORDER_CONFIRMATION_TEMPLATE = (order: Order, items: any[]) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; background-color: #F5F5DC; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; color: #FFD700; margin-bottom: 10px; }
        .title { font-size: 24px; color: #5D4E37; font-weight: bold; }
        .order-info { background: #F5F5DC; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { border-bottom: 1px solid #ddd; padding: 15px 0; display: flex; justify-content: space-between; }
        .item:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #FFD700; text-align: right; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #8B7355; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🍪</div>
            <div class="title">Dulce Codigo</div>
        </div>
        
        <h2 style="color: #5D4E37;">¡Hola ${order.customerName}!</h2>
        
        <p>Gracias por tu pedido. Hemos recibido tu orden y está siendo procesada con mucho cariño.</p>
        
        <div class="order-info">
            <h3 style="color: #5D4E37; margin-top: 0;">Detalles de tu Pedido #${order.id}</h3>
            <p><strong>Estado:</strong> <span style="color: #FFD700;">Confirmado</span></p>
            <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
            <p><strong>Dirección de entrega:</strong> ${order.address}</p>
        </div>
        
        <h3 style="color: #5D4E37;">Productos:</h3>
        ${items.map(item => `
            <div class="item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>Cantidad: ${item.quantity}</small>
                </div>
                <div>$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
            </div>
        `).join('')}
        
        <div class="total">
            Total: $${order.total}
        </div>
        
        <p style="margin-top: 30px;">Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
        
        <div class="footer">
            <p>¡Gracias por elegir Dulce Codigo!</p>
            <p>Para cualquier consulta, contáctanos en info@dulcecodigo.es</p>
        </div>
    </div>
</body>
</html>
`;

const ORDER_STATUS_UPDATE_TEMPLATE = (order: Order, newStatus: string, customerName: string) => {
  const statusMessages: Record<string, string> = {
    'pending': 'Tu pedido está pendiente de confirmación',
    'confirmed': 'Tu pedido ha sido confirmado y está en preparación',
    'preparing': 'Estamos preparando tu pedido con mucho cariño',
    'ready': 'Tu pedido está listo para entrega',
    'delivered': '¡Tu pedido ha sido entregado! Esperamos que disfrutes nuestras galletas',
    'cancelled': 'Tu pedido ha sido cancelado'
  };

  const statusColors: Record<string, string> = {
    'pending': '#FFA500',
    'confirmed': '#32CD32',
    'preparing': '#1E90FF',
    'ready': '#FFD700',
    'delivered': '#32CD32',
    'cancelled': '#FF4500'
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; background-color: #F5F5DC; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; color: #FFD700; margin-bottom: 10px; }
        .title { font-size: 24px; color: #5D4E37; font-weight: bold; }
        .status-badge { 
            display: inline-block; 
            padding: 10px 20px; 
            border-radius: 25px; 
            color: white; 
            font-weight: bold; 
            margin: 20px 0;
            background-color: ${statusColors[newStatus] || '#8B7355'};
        }
        .footer { text-align: center; margin-top: 30px; color: #8B7355; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🍪</div>
            <div class="title">Dulce Codigo</div>
        </div>
        
        <h2 style="color: #5D4E37;">¡Hola ${customerName}!</h2>
        
        <p>Te escribimos para informarte sobre una actualización en tu pedido #${order.id}.</p>
        
        <div style="text-align: center;">
            <div class="status-badge">${statusMessages[newStatus] || newStatus}</div>
        </div>
        
        ${newStatus === 'cancelled' ? 
          '<p style="color: #FF4500;">Lamentamos cualquier inconveniente. Si tienes alguna pregunta, no dudes en contactarnos.</p>' :
          '<p>Te mantendremos informado sobre cualquier cambio adicional en tu pedido.</p>'
        }
        
        <div class="footer">
            <p>¡Gracias por elegir Dulce Codigo!</p>
            <p>Para cualquier consulta, contáctanos en info@dulcecodigo.es o al +34 123 456 789</p>
        </div>
    </div>
</body>
</html>
`;
};

export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  try {
    const items = JSON.parse(order.items);
    
    await mailService.send({
      to: order.customerEmail,
      from: {
        email: 'emcookiesshop@gmail.com',
        name: 'Dulce Codigo'
      },
      subject: `Confirmación de Pedido #${order.id} - Dulce Codigo`,
      html: ORDER_CONFIRMATION_TEMPLATE(order, items),
    });
    
    console.log(`Order confirmation email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Log email details for debugging
    console.log('Email would have been sent with following details:');
    console.log(`To: ${order.customerEmail}`);
    console.log(`Subject: Confirmación de Pedido #${order.id}`);
    console.log(`Customer: ${order.customerName}`);
    console.log(`Total: $${order.total}`);
    console.log('Items:', JSON.parse(order.items));
    return false;
  }
}

export async function sendOrderStatusUpdate(order: Order, newStatus: string): Promise<boolean> {
  try {
    await mailService.send({
      to: order.customerEmail,
      from: {
        email: 'emcookiesshop@gmail.com',
        name: 'Dulce Codigo'
      },
      subject: `Actualización de Pedido #${order.id} - Dulce Codigo`,
      html: ORDER_STATUS_UPDATE_TEMPLATE(order, newStatus, order.customerName),
    });
    
    console.log(`Order status update email sent to ${order.customerEmail} - New status: ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return false;
  }
}