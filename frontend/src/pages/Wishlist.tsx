import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary pt-36 pb-16 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold uppercase mb-3">Your Wishlist is Empty</h1>
          <p className="text-text-muted mb-8">Save your favorite OUTLOOX pieces here and come back to them anytime.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-[#090909] hover:bg-[#242424] text-white px-8 py-3.5 rounded font-semibold uppercase text-sm tracking-wider">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide mb-3">Wishlist</h1>
        <p className="text-text-muted mb-8">Your saved favorites from the OUTLOOX catalog.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      </div>
    </div>
  );
}
