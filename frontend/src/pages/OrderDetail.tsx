import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../api/orderService';
import { ApiClientError } from '../api/apiClient';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../lib/data';
import type { OrderResponse } from '../lib/types';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (error) {
        showToast(error instanceof ApiClientError ? error.message : 'Unable to load order.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-bg-primary pt-32 flex items-center justify-center text-text-muted">Loading order…</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-bg-primary pt-32 flex items-center justify-center text-text-muted">Order not found.</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/profile" className="text-sm text-[#090909] hover:text-[#111111]">← Back to Profile</Link>
        <div className="mt-6 bg-bg-secondary border border-border-subtle rounded-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-text-muted text-sm">Order #{order.orderId}</p>
              <h1 className="font-display text-4xl font-bold uppercase">Order Details</h1>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#090909]/15 text-text-primary text-xs uppercase tracking-wider">{order.orderStatus}</span>
              <span className="px-3 py-1 rounded-full bg-text-primary/5 text-text-secondary text-xs uppercase tracking-wider">{order.paymentStatus}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {order.items.map((item) => (
                <div key={item.orderItemId} className="flex gap-4 bg-bg-primary/60 rounded-md p-4 border border-border-subtle">
                  <img src={item.productImage || '/placeholder-product.svg'} alt={item.productName} className="w-20 h-20 rounded-lg object-cover bg-bg-tertiary" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-sm text-text-muted">{item.color || 'Standard'} / {item.size || 'Standard'}</p>
                    <p className="text-sm text-text-muted">Quantity: {item.quantity}</p>
                    <p className="text-sm text-text-muted">Unit Price: {formatPrice(item.price)}</p>
                  </div>
                  <div className="font-semibold">{formatPrice(item.totalPrice)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-bg-primary/60 rounded-md p-5 border border-border-subtle">
                <h2 className="font-display text-xl uppercase mb-4">Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-text-muted">Order Date</span><span>{new Date(order.orderDate).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Payment Method</span><span>{order.paymentMethod}</span></div>
                  <div className="flex justify-between font-semibold text-base pt-3 border-t border-border-subtle"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
                </div>
              </div>
              <div className="bg-bg-primary/60 rounded-md p-5 border border-border-subtle">
                <h2 className="font-display text-xl uppercase mb-4">Shipping Address</h2>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-text-muted mt-1">{order.shippingAddress.addressLine}</p>
                <p className="text-sm text-text-muted">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                <p className="text-sm text-text-muted">{order.shippingAddress.country}</p>
                <p className="text-sm text-text-muted mt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
