import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getProductById, getProducts } from '../api/productService';
import { adaptBackendProduct } from '../lib/productAdapter';
import type { Product } from '../lib/types';

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  fetchProduct: (id: string) => Promise<Product | undefined>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const refreshProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      const mapped = data.map(adaptBackendProduct);
      setProducts(mapped);
      setError(null);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setError('Product catalog is temporarily unavailable. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshProducts();
  }, []);

  const getProduct = (id: string) => products.find((product) => product.id === id || product.slug === id || String(product.backendId) === id);

  const fetchProduct = async (id: string) => {
    const existing = getProduct(id);
    if (existing) return existing;

    try {
      const data = await getProductById(id);
      const mapped = adaptBackendProduct(data);
      setProducts((current) => {
        if (current.some((product) => product.backendId === mapped.backendId)) return current;
        return [...current, mapped];
      });
      return mapped;
    } catch {
      return undefined;
    }
  };

  const value = useMemo(
    () => ({ products, loading, error, refreshProducts, getProduct, fetchProduct }),
    [products, loading, error],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within ProductsProvider');
  return context;
}
