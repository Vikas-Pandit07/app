import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Grid3X3, LayoutList, SlidersHorizontal, X } from '../lib/icons';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { categories, formatPrice } from '../lib/data';
import { useProducts } from '../context/ProductsContext';

export default function Shop() {
  const { products, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const urlCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';

  useEffect(() => {
    if (categories.some((category) => category.id === urlCategory)) setSelectedCategory(urlCategory);
  }, [urlCategory]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'all') result = result.filter((product) => product.category === selectedCategory);
    if (urlSearch) {
      const query = urlSearch.toLowerCase();
      result = result.filter((product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query) || product.category.toLowerCase().includes(query));
    }
    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1]);
    switch (sortBy) {
      case 'price-low':
        return result.sort((a, b) => a.price - b.price);
      case 'price-high':
        return result.sort((a, b) => b.price - a.price);
      case 'newest':
        return result.sort((a, b) => (a.badge === 'new' ? -1 : b.badge === 'new' ? 1 : 0));
      case 'rating':
        return result.sort((a, b) => b.rating - a.rating);
      default:
        return result;
    }
  }, [products, selectedCategory, urlSearch, priceRange, sortBy]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const nextParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') nextParams.delete('category');
    else nextParams.set('category', categoryId);
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 5000]);
    setSortBy('featured');
    setSearchParams(urlSearch ? new URLSearchParams({ search: urlSearch }) : new URLSearchParams());
  };

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + (priceRange[1] < 5000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-bg-primary pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mb-4">
            <span>Home</span><span>/</span><span className="text-text-primary">Shop</span>
            {urlSearch && <><span>/</span><span className="text-[#090909]">Search: "{urlSearch}"</span></>}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide">
            {urlSearch ? 'Search Results' : selectedCategory === 'all' ? 'All Products' : categories.find((category) => category.id === selectedCategory)?.label}
          </h1>
          <p className="text-text-muted mt-2">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
          {error && <p className="text-xs text-amber-400 mt-2">{error}</p>}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button key={category.id} onClick={() => handleCategoryChange(category.id)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedCategory === category.id ? 'bg-[#090909] text-white' : 'text-text-secondary hover:bg-text-primary/5 hover:text-text-primary'}`}>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">Price Range</h3>
                <div className="space-y-3">
                  <input type="range" min="0" max="5000" step="100" value={priceRange[1]} onChange={(e) => setPriceRange([0, Number.parseInt(e.target.value, 10)])} className="w-full accent-[#090909]" />
                  <div className="flex items-center justify-between text-sm text-text-secondary"><span>{formatPrice(0)}</span><span>{formatPrice(priceRange[1])}</span></div>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:hidden flex items-center justify-between gap-4">
            <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-text-primary/5 rounded-lg text-sm font-medium text-text-primary">
              <SlidersHorizontal size={16} /> Filters
              {activeFiltersCount > 0 && <span className="bg-[#090909] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-text-primary/5 border border-border-subtle text-text-primary text-sm rounded-lg px-4 py-2.5 pr-10 focus:border-[#090909]">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          <div className="flex-1">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button className="p-2 text-[#090909]" aria-label="Grid view"><Grid3X3 size={18} /></button>
                <button className="p-2 text-text-muted hover:text-text-primary" aria-label="List view"><LayoutList size={18} /></button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted">Sort by:</span>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-text-primary/5 border border-border-subtle text-text-primary text-sm rounded-lg px-4 py-2 pr-10 focus:border-[#090909]">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-text-muted">Loading products...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
              </div>
            ) : (
              <div className="text-center py-20 bg-bg-secondary rounded-lg">
                <p className="text-text-muted mb-4">No products found matching your filters.</p>
                <button onClick={clearFilters} className="bg-[#090909] hover:bg-[#242424] text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsMobileFilterOpen(false)} />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-bg-secondary p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="font-display text-xl font-bold uppercase">Filters</h2><button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-text-secondary hover:text-text-primary"><X size={20} /></button></div>
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">Categories</h3>
                <div className="space-y-2">{categories.map((category) => <button key={category.id} onClick={() => handleCategoryChange(category.id)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedCategory === category.id ? 'bg-[#090909] text-white' : 'text-text-secondary hover:bg-text-primary/5 hover:text-text-primary'}`}>{category.label}</button>)}</div>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">Price Range</h3>
                <div className="space-y-3">
                  <input type="range" min="0" max="5000" step="100" value={priceRange[1]} onChange={(e) => setPriceRange([0, Number.parseInt(e.target.value, 10)])} className="w-full accent-[#090909]" />
                  <div className="flex items-center justify-between text-sm text-text-secondary"><span>{formatPrice(0)}</span><span>{formatPrice(priceRange[1])}</span></div>
                </div>
              </div>
            </div>
            <button onClick={() => { clearFilters(); setIsMobileFilterOpen(false); }} className="w-full mt-8 border border-text-primary/20 text-text-primary py-3 rounded font-medium uppercase text-sm tracking-wider hover:bg-text-primary/5 transition-colors">Clear All</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
