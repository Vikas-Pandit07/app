import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { calculateDiscount, formatPrice } from '../lib/data';
import { Heart } from '../lib/icons';
import type { Product } from '../lib/types';
import StarRating from './StarRating';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.originalPrice);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const getBadgeStyles = () => {
    switch (product.badge) {
      case 'sale':
        return 'bg-black text-white';
      case 'new':
        return 'bg-black text-white';
      case 'bestseller':
        return 'bg-white text-black border border-black/10';
      default:
        return 'bg-black text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-bg-secondary rounded-md overflow-hidden mb-3 border border-border-subtle">
          {product.badge && (
            <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${getBadgeStyles()}`}>
              {product.badge}
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 border border-black/10 flex items-center justify-center transition-all ${
              isWishlisted(product.id)
                ? 'bg-[#ef4444] text-white'
                : 'text-black hover:text-[#ef4444]'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={16} />
          </button>

          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.svg';
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="block w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider text-center rounded-sm hover:bg-[#242424] transition-colors">
              View Product
            </span>
          </div>
        </div>
      </Link>

      <div className="space-y-1.5">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-text-primary group-hover:underline underline-offset-4 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <StarRating rating={product.rating} reviews={product.reviews} />

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold text-text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-text-muted line-through">{formatPrice(product.originalPrice)}</span>
              {discount > 0 && <span className="text-xs text-[#ef4444] font-medium">{discount}% OFF</span>}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
