import { motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from '../lib/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { CartStore } from '../lib/cartStore';
import { formatPrice } from '../lib/data';
import { useAuth } from '../context/AuthContext';

interface CartProps {
  cart: CartStore;
}

export default function Cart({ cart }: CartProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const shipping = cart.subtotal > 999 ? 0 : 99;
  const total = cart.subtotal + shipping;

  if (cart.items.length === 0 && !cart.loading) {
    return (
      <div className="min-h-screen bg-bg-primary pt-36 pb-16 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingBag size={32} className="text-[#090909]" /></div>
          <h1 className="font-display text-3xl font-bold uppercase mb-3">Your Cart is Empty</h1>
          <p className="text-text-muted mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-[#090909] hover:bg-[#242424] text-white px-8 py-3.5 rounded font-semibold uppercase text-sm tracking-wider transition-all">Start Shopping <ArrowRight size={18} /></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide mb-4">Shopping Cart</h1>
        <p className="text-sm text-text-muted mb-8">{isAuthenticated ? 'Your cart is synced to your account.' : 'You are using a guest cart. Login before checkout to place your order.'}</p>
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <motion.div key={`${item.product.id}-${item.size}-${item.color}-${item.backendItemId || 'guest'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex gap-4 bg-bg-secondary rounded-lg p-4">
                <Link to={`/product/${item.product.id}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-bg-tertiary rounded-md overflow-hidden flex-shrink-0"><img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} /></Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/product/${item.product.id}`}><h3 className="font-medium text-text-primary truncate hover:text-[#090909] transition-colors">{item.product.name}</h3></Link>
                      <p className="text-sm text-text-muted mt-1">{item.color} / {item.size}</p>
                    </div>
                    <button onClick={() => void cart.removeItem(item.product.id, item.size, item.color, item.backendItemId)} className="text-text-muted hover:text-[#ef4444] transition-colors p-1" aria-label="Remove item"><Trash2 size={18} /></button>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-text-primary/20 rounded">
                      <button onClick={() => void cart.updateQuantity(item.product.id, item.size, item.color, item.quantity - 1, item.backendItemId)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-text-primary/5 transition-colors" aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => void cart.updateQuantity(item.product.id, item.size, item.color, item.quantity + 1, item.backendItemId)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-text-primary/5 transition-colors" aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                    <div className="text-right"><p className="font-semibold text-text-primary">{formatPrice(item.product.price * item.quantity)}</p>{item.quantity > 1 && <p className="text-xs text-text-muted">{formatPrice(item.product.price)} each</p>}</div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <Link to="/shop" className="text-sm text-[#090909] hover:text-[#111111] font-medium uppercase tracking-wider">← Continue Shopping</Link>
              <button onClick={() => void cart.clearCart()} className="text-sm text-text-muted hover:text-[#ef4444] transition-colors">Clear Cart</button>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary rounded-lg p-6 sticky top-28">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm mb-6"><div className="flex items-center justify-between text-text-secondary"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div><div className="flex items-center justify-between text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div><div className="flex items-center justify-between text-text-secondary"><span>Tax</span><span>Included</span></div><div className="border-t border-border-subtle pt-3 flex items-center justify-between text-base font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div></div>
              {cart.subtotal < 999 && <div className="bg-[#090909]/10 border border-[#090909]/20 rounded-lg p-3 mb-6 flex items-start gap-3"><Truck size={18} className="text-[#090909] flex-shrink-0 mt-0.5" /><p className="text-xs text-text-secondary">Add items worth {formatPrice(999 - cart.subtotal)} more for <span className="text-[#090909] font-semibold">FREE shipping</span>.</p></div>}
              <button onClick={() => navigate('/checkout')} className="w-full bg-[#090909] hover:bg-[#242424] text-white py-3.5 rounded font-semibold uppercase text-sm tracking-wider transition-colors mb-3">Proceed to Checkout</button>
              <div className="flex items-center justify-center gap-2 text-xs text-text-muted"><span className="w-6 h-4 bg-text-primary/10 rounded-sm" /><span className="w-6 h-4 bg-text-primary/10 rounded-sm" /><span className="w-6 h-4 bg-text-primary/10 rounded-sm" /><span>Secure Checkout</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
