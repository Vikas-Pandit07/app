import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import type { CartStore } from '../lib/cartStore';
import { calculateDiscount, formatPrice } from '../lib/data';
import { Check, ChevronRight, Heart, RefreshCw, Share2, ShieldCheck, ShoppingBag, Star, Truck } from '../lib/icons';
import type { Product } from '../lib/types';

interface ProductDetailProps {
  cart: CartStore;
}

const colorMap: Record<string, string> = {
  Black: '#000000',
  White: '#ffffff',
  Grey: '#6b7280',
  Olive: '#556b2f',
  Brown: '#8b4513',
  Beige: '#d2b48c',
  Lavender: '#e6e6fa',
  Sage: '#9caf88',
  'Dusty Pink': '#d4a5a5',
  Monochrome: '#292524',
  'Black/White': '#000000',
  Violet: '#090909',
  Khaki: '#b19767',
  Standard: '#090909',
};

const reviewWidths = [90, 72, 48, 22, 10];

export default function ProductDetail({ cart }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, getProduct, fetchProduct, loading } = useProducts();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [product, setProduct] = useState<Product | undefined>(id ? getProduct(id) : undefined);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping' | 'reviews'>('details');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const nextProduct = await fetchProduct(id);
      setProduct(nextProduct);
    };
    void load();
  }, [id, fetchProduct]);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[0]);
      setActiveImage(0);
      setIsAdded(false);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product && loading) {
    return <div className="min-h-screen bg-bg-primary pt-36 flex items-center justify-center text-text-muted">Loading product…</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-primary pt-36 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-text-muted mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="bg-[#090909] hover:bg-[#242424] text-white px-6 py-3 rounded font-medium transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.originalPrice);
  const relatedProducts = products.filter((entry) => entry.category === product.category && entry.id !== product.id).slice(0, 4);

  const handleAddToCart = async () => {
    await cart.addItem(product, selectedSize, selectedColor, 1);
    setIsAdded(true);
    showToast(isAuthenticated ? 'Item added to your account cart.' : 'Item added to your guest cart.', 'success');
  };

  const handleBuyNow = async () => {
    await cart.addItem(product, selectedSize, selectedColor, 1);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link to="/" className="hover:text-text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?category=${product.category}`} className="hover:text-text-primary capitalize">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-text-primary truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <div className="aspect-square bg-bg-secondary rounded-lg overflow-hidden relative">
              {product.badge && (
                <span className={`absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${
                  product.badge === 'sale'
                    ? 'bg-[#ef4444] text-text-primary'
                    : product.badge === 'new'
                      ? 'bg-[#090909] text-white'
                      : 'bg-white text-black'
                }`}>{product.badge}</span>
              )}
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, index) => (
                <button key={index} onClick={() => setActiveImage(index)} className={`aspect-square bg-bg-secondary rounded-lg overflow-hidden border-2 transition-colors ${activeImage === index ? 'border-[#090909]' : 'border-transparent hover:border-text-primary/20'}`}>
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide mb-3">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={product.rating} reviews={product.reviews} size={16} />
              <span className="text-sm text-text-muted">{product.reviews} Reviews</span>
            </div>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-3xl font-bold text-text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-text-muted line-through">{formatPrice(product.originalPrice)}</span>
                  {discount > 0 && <span className="bg-[#ef4444] text-text-primary text-xs font-bold px-2 py-1 rounded">{discount}% OFF</span>}
                </>
              )}
            </div>

            <p className="text-text-muted leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">Color: <span className="text-text-secondary">{selectedColor}</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setIsAdded(false);
                    }}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-[#090909] scale-110' : 'border-text-primary/20 hover:border-white/40'}`}
                    aria-label={color}
                    title={color}
                  >
                    <span className="w-7 h-7 rounded-full border border-border-subtle" style={{ backgroundColor: colorMap[color] || '#888' }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">Size: <span className="text-text-secondary">{selectedSize}</span></span>
                <button className="text-xs text-[#090909] hover:text-[#111111] underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setIsAdded(false);
                    }}
                    className={`min-w-[48px] px-3 py-2 rounded border text-sm font-medium transition-all ${selectedSize === size ? 'bg-[#090909] border-[#090909] text-white' : 'bg-transparent border-text-primary/20 text-text-secondary hover:border-text-primary/50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button onClick={() => void handleAddToCart()} className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3.5 rounded font-semibold uppercase text-sm tracking-wider transition-all ${isAdded ? 'bg-green-600 text-white' : 'bg-[#090909] hover:bg-[#242424] text-white'}`}>
                {isAdded ? <><Check size={18} /> Added to Cart</> : <><ShoppingBag size={18} /> Add to Cart</>}
              </button>

              <button onClick={() => void handleBuyNow()} className="flex-1 min-w-[160px] bg-[#ef4444] hover:bg-[#dc2626] text-text-primary py-3.5 rounded font-semibold uppercase text-sm tracking-wider transition-colors">
                Buy Now
              </button>

              <button onClick={() => toggleWishlist(product)} className={`w-12 h-12 border rounded flex items-center justify-center transition-colors ${isWishlisted(product.id) ? 'border-[#ef4444] text-[#ef4444]' : 'border-text-primary/20 text-text-secondary hover:text-[#ef4444] hover:border-[#ef4444]'}`} aria-label="Add to wishlist">
                <Heart size={20} />
              </button>

              <button className="w-12 h-12 border border-text-primary/20 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-primary/50 transition-colors" aria-label="Share product">
                <Share2 size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-bg-secondary rounded-lg p-3 text-center"><Truck size={20} className="mx-auto text-[#090909] mb-2" /><p className="text-[10px] uppercase tracking-wider text-text-secondary">Free Shipping</p><p className="text-[10px] text-text-muted">above ₹999</p></div>
              <div className="bg-bg-secondary rounded-lg p-3 text-center"><RefreshCw size={20} className="mx-auto text-[#090909] mb-2" /><p className="text-[10px] uppercase tracking-wider text-text-secondary">Easy Returns</p><p className="text-[10px] text-text-muted">7 days</p></div>
              <div className="bg-bg-secondary rounded-lg p-3 text-center"><ShieldCheck size={20} className="mx-auto text-[#090909] mb-2" /><p className="text-[10px] uppercase tracking-wider text-text-secondary">Secure</p><p className="text-[10px] text-text-muted">Payment</p></div>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <div className="flex flex-wrap gap-6 border-b border-border-subtle mb-4">
                {(['details', 'care', 'shipping', 'reviews'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium uppercase tracking-wider transition-colors relative ${activeTab === tab ? 'text-[#090909]' : 'text-text-muted hover:text-text-primary'}`}>
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#090909]" />}
                  </button>
                ))}
              </div>

              <div className="text-sm text-text-muted leading-relaxed">
                {activeTab === 'details' && (
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2"><Check size={14} className="text-[#090909]" /> {feature}</li>
                    ))}
                  </ul>
                )}
                {activeTab === 'care' && <p>Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on low heat if needed. Wash inside out to preserve print quality.</p>}
                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>Free standard shipping on all orders above ₹999. Orders are dispatched within 24-48 hours.</p>
                    <p>Metro cities: 2-4 business days. Non-metro: 4-7 business days.</p>
                    <p>Cash on delivery available for orders up to ₹5000.</p>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold">{product.rating}</div>
                      <div>
                        <StarRating rating={product.rating} />
                        <p className="text-text-muted text-xs mt-1">Based on {product.reviews} reviews</p>
                      </div>
                    </div>
                    {[5, 4, 3, 2, 1].map((star, index) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3">{star}</span>
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-1.5 bg-text-primary/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#090909] rounded-full" style={{ width: `${reviewWidths[index]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((entry, index) => <ProductCard key={entry.id} product={entry} index={index} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
