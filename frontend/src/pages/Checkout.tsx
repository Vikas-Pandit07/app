import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, CheckCircle2, ChevronRight, CreditCard, ShieldCheck, Truck, Wallet } from '../lib/icons';
import { Link } from 'react-router-dom';
import type { CartStore } from '../lib/cartStore';
import { formatPrice } from '../lib/data';
import type { Address, AddressPayload, OrderDetails } from '../lib/types';
import { addUserAddress, getUserAddresses } from '../api/addressService';
import { checkoutOrder } from '../api/orderService';
import { createPaymentOrder, verifyPayment } from '../api/paymentService';
import { ApiClientError } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CheckoutProps {
  cart: CartStore;
}

const initialAddress = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout({ cart }: CheckoutProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(initialAddress);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    email: user?.email || '',
    fullName: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await getUserAddresses();
        const fetched = data.addresses || [];
        setAddresses(fetched);
        const preferred = fetched.find((address) => address.default) || fetched[0];
        setSelectedAddressId(preferred?.addressId || null);
      } catch (error) {
        showToast(error instanceof ApiClientError ? error.message : 'Unable to load saved addresses.', 'error');
      }
    };

    void loadAddresses();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setOrderDetails((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.addressId === selectedAddressId) || null,
    [addresses, selectedAddressId],
  );

  if (cart.items.length === 0 && !isOrderPlaced) {
    return (
      <div className="min-h-screen bg-bg-primary pt-36 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold uppercase mb-3">Your Cart is Empty</h1>
          <p className="text-text-muted mb-6">Add some items to proceed to checkout.</p>
          <Link to="/shop" className="bg-[#090909] hover:bg-[#242424] text-white px-6 py-3 rounded font-medium transition-colors">Shop Now</Link>
        </div>
      </div>
    );
  }

  const shipping = cart.subtotal > 999 ? 0 : 99;
  const total = cart.subtotal + shipping;

  const handlePaymentMethodChange = (value: OrderDetails['paymentMethod']) => {
    setOrderDetails((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handleAddressSave = async () => {
    const payload: AddressPayload = {
      fullName: addressForm.fullName,
      phone: addressForm.phone,
      addressLine: addressForm.address,
      city: addressForm.city,
      state: addressForm.state,
      pinCode: addressForm.pincode,
      country: 'India',
      isDefault: addresses.length === 0,
    };

    try {
      const result = await addUserAddress(payload);
      showToast(result.message, 'success');
      const refreshed = await getUserAddresses();
      setAddresses(refreshed.addresses || []);
      setSelectedAddressId(result.address.addressId);
      setShowAddressForm(false);
      setAddressForm(initialAddress);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Unable to save address.', 'error');
    }
  };

  const handleOnlinePayment = async (internalOrderId: number) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error('Unable to load Razorpay checkout script.');
    }

    const paymentOrder = await createPaymentOrder(internalOrderId);

    await new Promise<void>((resolve, reject) => {
      const razorpay = new window.Razorpay!({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || 'INR',
        name: 'OUTLOOX',
        description: `Order #${paymentOrder.internalOrderId}`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: selectedAddress?.fullName || user?.username || '',
          email: orderDetails.email,
          contact: selectedAddress?.phone || '',
        },
        theme: { color: '#090909' },
        handler: async (response: any) => {
          try {
            const verification = await verifyPayment({
              internalOrderId: paymentOrder.internalOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (!verification.verified) {
              reject(new Error(verification.message || 'Payment verification failed.'));
              return;
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled by the customer.')),
        },
      });

      razorpay.on('payment.failed', (response: any) => {
        reject(new Error(response?.error?.description || 'Payment failed.'));
      });

      razorpay.open();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      showToast('Please select or add a delivery address first.', 'error');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const backendPaymentMethod = orderDetails.paymentMethod === 'cod' ? 'COD' : 'RAZORPAY';
      const order = await checkoutOrder({ addressId: selectedAddressId, paymentMethod: backendPaymentMethod });

      if (backendPaymentMethod === 'RAZORPAY') {
        await handleOnlinePayment(order.orderId);
      }

      await cart.refreshCart();
      showToast(order.message || 'Order placed successfully.', 'success');
      setIsOrderPlaced(true);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : error instanceof Error ? error.message : 'Unable to place order.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-bg-primary pt-36 pb-16 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h1 className="font-display text-3xl font-bold uppercase mb-3">Order Confirmed!</h1>
          <p className="text-text-muted mb-2">Thank you for shopping with OUTLOOX.</p>
          <p className="text-text-muted mb-8">Your order has been placed successfully. You can track it from your profile.</p>
          <Link to="/profile" className="inline-flex items-center gap-2 bg-[#090909] hover:bg-[#242424] text-white px-8 py-3.5 rounded font-semibold uppercase text-sm tracking-wider transition-all">Go to Profile</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8"><Link to="/cart" className="hover:text-text-primary">Cart</Link><ChevronRight size={14} /><span className="text-text-primary">Checkout</span></div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-bg-secondary rounded-lg p-6">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-4">Contact Information</h2>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Email</label>
                  <input type="email" required value={orderDetails.email} onChange={(e) => setOrderDetails((prev) => ({ ...prev, email: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3 text-text-primary" />
                </div>
              </div>

              <div className="bg-bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide">Shipping Address</h2>
                  <button type="button" onClick={() => setShowAddressForm((prev) => !prev)} className="text-sm text-[#090909] hover:text-[#111111] font-medium">
                    {showAddressForm ? 'Cancel' : 'Add New Address'}
                  </button>
                </div>

                {addresses.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {addresses.map((address) => (
                      <button
                        type="button"
                        key={address.addressId}
                        onClick={() => setSelectedAddressId(address.addressId)}
                        className={`text-left rounded-md border p-4 transition-colors ${selectedAddressId === address.addressId ? 'border-[#090909] bg-[#090909]/10' : 'border-border-subtle hover:border-text-primary/25'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{address.fullName}</p>
                            <p className="text-sm text-text-muted">{address.phone}</p>
                          </div>
                          {address.default && <span className="text-[10px] uppercase tracking-wider bg-[#090909] text-white px-2 py-1 rounded">Default</span>}
                        </div>
                        <p className="text-sm text-text-secondary mt-3">{address.addressLine}</p>
                        <p className="text-sm text-text-secondary">{address.city}, {address.state} - {address.pinCode}</p>
                      </button>
                    ))}
                  </div>
                )}

                {showAddressForm && (
                  <div className="border-t border-border-subtle pt-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-text-secondary mb-2">Full Name</label>
                        <input type="text" value={addressForm.fullName} onChange={(e) => setAddressForm((prev) => ({ ...prev, fullName: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-text-secondary mb-2">Address</label>
                        <textarea value={addressForm.address} rows={3} onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3 resize-none" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">City</label>
                        <input type="text" value={addressForm.city} onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">State</label>
                        <input type="text" value={addressForm.state} onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">PIN Code</label>
                        <input type="text" value={addressForm.pincode} onChange={(e) => setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Phone</label>
                        <input type="text" value={addressForm.phone} onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" />
                      </div>
                    </div>
                    <button onClick={() => void handleAddressSave()} className="mt-4 bg-[#090909] hover:bg-[#242424] text-white px-5 py-2.5 rounded-lg font-medium" type="button">
                      Save Address
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-bg-secondary rounded-lg p-6">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: Banknote },
                    { value: 'upi', label: 'UPI / Wallet', desc: 'Processed securely via Razorpay', icon: Wallet },
                    { value: 'card', label: 'Credit / Debit Card', desc: 'Processed securely via Razorpay', icon: CreditCard },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isActive = orderDetails.paymentMethod === option.value;
                    return (
                      <label key={option.value} className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${isActive ? 'border-[#090909] bg-[#090909]/10' : 'border-border-subtle hover:border-text-primary/30'}`}>
                        <input type="radio" name="paymentMethod" value={option.value} checked={isActive} onChange={() => handlePaymentMethodChange(option.value as OrderDetails['paymentMethod'])} className="accent-[#090909]" />
                        <Icon size={20} className="text-text-secondary" />
                        <div><p className="font-medium text-text-primary">{option.label}</p><p className="text-xs text-text-muted">{option.desc}</p></div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={isPlacingOrder} className="w-full bg-[#090909] hover:bg-[#242424] text-white py-4 rounded-lg font-semibold uppercase text-sm tracking-wider transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                {isPlacingOrder ? <><span className="w-5 h-5 border-2 border-text-primary/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Place Order — {formatPrice(total)}</>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-bg-secondary rounded-lg p-6 sticky top-28">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}-${item.backendItemId || 'guest'}`} className="flex gap-3">
                    <div className="w-16 h-16 bg-bg-tertiary rounded overflow-hidden flex-shrink-0 relative">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#090909] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-text-primary truncate">{item.product.name}</p><p className="text-xs text-text-muted">{item.color} / {item.size}</p><p className="text-sm text-text-secondary mt-1">{formatPrice(item.product.price * item.quantity)}</p></div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border-subtle pt-4 space-y-3 text-sm"><div className="flex items-center justify-between text-text-secondary"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div><div className="flex items-center justify-between text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div><div className="flex items-center justify-between text-text-secondary"><span>Tax</span><span>Included</span></div><div className="border-t border-border-subtle pt-3 flex items-center justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div></div>
              <div className="mt-6 space-y-3"><div className="flex items-center gap-2 text-xs text-text-muted"><Truck size={14} /> Free shipping on orders above ₹999</div><div className="flex items-center gap-2 text-xs text-text-muted"><ShieldCheck size={14} /> Secure checkout powered by Razorpay</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
