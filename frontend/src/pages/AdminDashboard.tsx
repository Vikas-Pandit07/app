import { useEffect, useMemo, useState } from 'react';
import {
  createAdminProduct,
  createCategory,
  deleteAdminProduct,
  deleteCategory,
  getAdminOrders,
  getAdminProducts,
  getAdminSiteSettings,
  getAdminStats,
  getAdminUsers,
  getCategories,
  saveAdminSiteSettings,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminUserStatus,
  updateCategory,
  type AdminStatsResponse,
  type AdminUser,
  type CategoryOption,
} from '../api/adminService';
import { ApiClientError } from '../api/apiClient';
import { useToast } from '../context/ToastContext';
import { adaptBackendProduct } from '../lib/productAdapter';
import { formatPrice } from '../lib/data';
import type { Product } from '../lib/types';

const statusOptions = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const emptyForm = { name: '', slug: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '', badge: '', rating: '4.5', reviews: '0', colors: '', sizes: '', features: '', imageUrls: '', status: 'ACTIVE' };
const emptyCategoryForm = { categoryName: '', description: '' };
const defaultSettingsForm: Record<string, string> = {
  announcement_primary: '',
  announcement_secondary: '',
  announcement_tertiary: '',
  announcement_quaternary: '',
  hero_badge: '',
  hero_title_line1: '',
  hero_title_line2: '',
  hero_subtitle: '',
  footer_email: '',
  footer_phone: '',
  footer_city: '',
};

function toPayload(form: typeof emptyForm) {
  return {
    name: form.name,
    slug: form.slug || undefined,
    description: form.description,
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    stock: Number(form.stock),
    categoryId: Number(form.categoryId),
    badge: form.badge || undefined,
    rating: Number(form.rating),
    reviews: Number(form.reviews),
    colors: form.colors ? form.colors.split(',').map((v) => v.trim()).filter(Boolean) : [],
    sizes: form.sizes ? form.sizes.split(',').map((v) => v.trim()).filter(Boolean) : [],
    features: form.features ? form.features.split(',').map((v) => v.trim()).filter(Boolean) : [],
    imageUrls: form.imageUrls ? form.imageUrls.split(',').map((v) => v.trim()).filter(Boolean) : [],
    status: form.status,
  };
}

function fromProduct(product: Product) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    stock: String(product.stock),
    categoryId: '',
    badge: product.badge || '',
    rating: String(product.rating),
    reviews: String(product.reviews),
    colors: product.colors.join(', '),
    sizes: product.sizes.join(', '),
    features: product.features.join(', '),
    imageUrls: product.images.join(', '),
    status: product.status || 'ACTIVE',
  };
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'categories' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>(defaultSettingsForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes, usersRes, categoriesRes, settingsRes] = await Promise.all([
        getAdminStats(),
        getAdminProducts(),
        getAdminOrders(),
        getAdminUsers(),
        getCategories(),
        getAdminSiteSettings(),
      ]);
      setStats(statsRes.stats);
      setProducts((productsRes.products || []).map(adaptBackendProduct));
      setOrders(ordersRes.orders || []);
      setUsers(usersRes.users || []);
      setCategories(categoriesRes.data || []);
      const mappedSettings = { ...defaultSettingsForm };
      (settingsRes.settings || []).forEach((item) => {
        mappedSettings[item.key] = item.value || '';
      });
      setSettingsForm(mappedSettings);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to load admin dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const categoryLookup = useMemo(() => Object.fromEntries(categories.map((c) => [c.categoryName.toLowerCase(), String(c.categoryId)])), [categories]);

  const startEdit = (product: Product) => {
    setEditingProductId(product.backendId);
    const next = fromProduct(product);
    next.categoryId = categoryLookup[product.category.toLowerCase()] || '';
    setForm(next);
    setActiveTab('products');
  };

  const resetForm = () => {
    setEditingProductId(null);
    setForm(emptyForm);
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = toPayload(form);
      if (editingProductId) {
        await updateAdminProduct(editingProductId, payload);
        showToast('Product updated successfully.', 'success');
      } else {
        await createAdminProduct(payload);
        showToast('Product created successfully.', 'success');
      }
      resetForm();
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      await deleteAdminProduct(productId);
      showToast('Product disabled successfully.', 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to disable product.', 'error');
    }
  };

  const changeOrderStatus = async (orderId: number, status: string) => {
    try {
      await updateAdminOrderStatus(orderId, status);
      showToast('Order status updated.', 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to update order.', 'error');
    }
  };

  const toggleUser = async (userId: number, active: boolean) => {
    try {
      await updateAdminUserStatus(userId, active);
      showToast(`User ${active ? 'activated' : 'deactivated'}.`, 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to update user.', 'error');
    }
  };

  const startCategoryEdit = (category: CategoryOption) => {
    setEditingCategoryId(category.categoryId);
    setCategoryForm({ categoryName: category.categoryName, description: category.description || '' });
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryForm);
        showToast('Category updated successfully.', 'success');
      } else {
        await createCategory(categoryForm);
        showToast('Category created successfully.', 'success');
      }
      resetCategoryForm();
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to save category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const removeCategory = async (categoryId: number) => {
    try {
      await deleteCategory(categoryId);
      showToast('Category deleted.', 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to delete category.', 'error');
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveAdminSiteSettings(settingsForm);
      showToast('Site settings updated successfully.', 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to save site settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-bg-primary pt-32 flex items-center justify-center text-text-muted">Loading admin dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-lg border border-[#090909]/20 bg-gradient-to-br from-bg-secondary to-bg-primary p-8 shadow-[0_20px_80px_rgba(124,58,237,0.15)]">
          <p className="text-[#090909] text-xs uppercase tracking-[0.25em] font-bold mb-3">OUTLOOX Admin</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase">Control Center</h1>
          <p className="text-text-muted mt-3 max-w-2xl">Manage the storefront catalog, customers, orders, categories, and editable public-facing site settings from a single premium dashboard.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {[
            ['overview', 'Overview'],
            ['products', 'Products'],
            ['orders', 'Orders'],
            ['users', 'Users'],
            ['categories', 'Categories'],
            ['settings', 'Site Settings'],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key as any)} className={`px-5 py-3 rounded-full text-sm uppercase tracking-wider transition-colors ${activeTab === key ? 'bg-[#090909] text-white' : 'bg-bg-secondary text-text-secondary hover:text-text-primary'}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                ['Revenue', formatPrice(stats.totalRevenue)],
                ['Orders', String(stats.totalOrders)],
                ['Products', String(stats.totalProducts)],
                ['Customers', String(stats.totalCustomers)],
              ].map(([label, value]) => (
                <div key={label} className="bg-bg-secondary rounded-lg border border-border-subtle p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-3">{label}</p>
                  <h2 className="font-display text-3xl font-bold">{value}</h2>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-bg-secondary rounded-lg border border-border-subtle p-6">
                <h3 className="font-display text-2xl uppercase mb-5">Recent Orders</h3>
                <div className="space-y-3">{stats.recentOrders.map((order) => <div key={order.orderId} className="flex items-center justify-between gap-4 border-b border-border-subtle pb-3"><div><p className="font-medium">#{order.orderId} — {order.customerName}</p><p className="text-sm text-text-muted">{order.date}</p></div><div className="text-right"><p>{formatPrice(order.amount)}</p><p className="text-xs text-[#ffffff] uppercase tracking-wider">{order.status}</p></div></div>)}</div>
              </div>
              <div className="bg-bg-secondary rounded-lg border border-border-subtle p-6">
                <h3 className="font-display text-2xl uppercase mb-5">Top Products</h3>
                <div className="space-y-3">{stats.topProducts.map((product) => <div key={product.productId} className="flex items-center justify-between gap-4 border-b border-border-subtle pb-3"><div><p className="font-medium">{product.productName}</p><p className="text-sm text-text-muted">Sold: {product.soldCount}</p></div><p>{formatPrice(product.revenue)}</p></div>)}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid xl:grid-cols-[1.1fr,.9fr] gap-6">
            <div className="bg-bg-secondary rounded-lg border border-border-subtle p-6 overflow-auto">
              <div className="flex items-center justify-between mb-5"><h3 className="font-display text-2xl uppercase">Products</h3><button onClick={resetForm} className="text-sm text-[#090909]">New Product</button></div>
              <div className="space-y-4">{products.map((product) => <div key={product.backendId} className="flex gap-4 bg-bg-primary/60 rounded-md border border-border-subtle p-4"><img src={product.images[0] || '/placeholder-product.svg'} alt={product.name} className="w-20 h-20 rounded-lg object-cover" /><div className="flex-1"><h4 className="font-semibold">{product.name}</h4><p className="text-sm text-text-muted">{product.category} • Stock {product.stock}</p><p className="text-sm text-text-muted">{product.colors.join(', ')} | {product.sizes.join(', ')}</p><div className="flex items-center gap-4 mt-3 text-sm"><button onClick={() => startEdit(product)} className="text-[#090909]">Edit</button><button onClick={() => void removeProduct(product.backendId)} className="text-red-400">Disable</button></div></div><div className="text-right"><p className="font-semibold">{formatPrice(product.price)}</p><p className="text-xs text-text-muted">{product.badge || 'standard'}</p></div></div>)}</div>
            </div>
            <div className="bg-bg-secondary rounded-lg border border-border-subtle p-6">
              <h3 className="font-display text-2xl uppercase mb-5">{editingProductId ? 'Edit Product' : 'Create Product'}</h3>
              <form onSubmit={submitProduct} className="space-y-4">
                {[['name', 'Name'], ['slug', 'Slug'], ['price', 'Price'], ['originalPrice', 'Original Price'], ['stock', 'Stock'], ['badge', 'Badge'], ['rating', 'Rating'], ['reviews', 'Reviews']].map(([key, label]) => <div key={key}><label className="block text-sm text-text-secondary mb-2">{label}</label><input value={(form as any)[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>)}
                <div><label className="block text-sm text-text-secondary mb-2">Category</label><select value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3"><option value="">Select category</option>{categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></div>
                <div><label className="block text-sm text-text-secondary mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>
                <div><label className="block text-sm text-text-secondary mb-2">Colors (comma separated)</label><input value={form.colors} onChange={(e) => setForm((prev) => ({ ...prev, colors: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>
                <div><label className="block text-sm text-text-secondary mb-2">Sizes (comma separated)</label><input value={form.sizes} onChange={(e) => setForm((prev) => ({ ...prev, sizes: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>
                <div><label className="block text-sm text-text-secondary mb-2">Features (comma separated)</label><input value={form.features} onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>
                <div><label className="block text-sm text-text-secondary mb-2">Image URLs (comma separated)</label><textarea value={form.imageUrls} onChange={(e) => setForm((prev) => ({ ...prev, imageUrls: e.target.value }))} rows={3} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>
                <div><label className="block text-sm text-text-secondary mb-2">Status</label><select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3">{['ACTIVE', 'OUT_OF_STOCK', 'DISABLED'].map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
                <div className="flex gap-3"><button type="submit" disabled={submitting} className="bg-[#090909] hover:bg-[#242424] disabled:opacity-70 text-white px-6 py-3 rounded-lg font-semibold uppercase text-sm tracking-wider">{editingProductId ? 'Update Product' : 'Create Product'}</button>{editingProductId && <button type="button" onClick={resetForm} className="border border-border-subtle px-6 py-3 rounded-lg text-text-secondary">Cancel</button>}</div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'orders' && <div className="space-y-4">{orders.map((order) => <div key={order.orderId} className="bg-bg-secondary rounded-lg border border-border-subtle p-5"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div><h4 className="font-semibold">Order #{order.orderId}</h4><p className="text-sm text-text-muted">{order.customerUsername} • {order.customerEmail}</p><p className="text-sm text-text-muted">{formatPrice(order.totalAmount)}</p></div><div className="flex items-center gap-3 flex-wrap"><span className="text-xs uppercase tracking-wider text-text-muted">{order.paymentStatus}</span><select value={order.orderStatus} onChange={(e) => void changeOrderStatus(order.orderId, e.target.value)} className="bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-2 text-sm">{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div></div>)}</div>}

        {activeTab === 'users' && <div className="space-y-4">{users.map((user) => <div key={user.userId} className="bg-bg-secondary rounded-lg border border-border-subtle p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h4 className="font-semibold">{user.username}</h4><p className="text-sm text-text-muted">{user.email}</p><p className="text-xs uppercase tracking-wider text-[#ffffff] mt-1">{user.role}</p></div><button onClick={() => void toggleUser(user.userId, !user.active)} className={`px-5 py-2 rounded-lg text-sm font-medium ${user.active ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'}`}>{user.active ? 'Deactivate' : 'Activate'}</button></div>)}</div>}

        {activeTab === 'categories' && (
          <div className="grid lg:grid-cols-[1fr,.8fr] gap-6">
            <div className="bg-bg-secondary rounded-lg border border-border-subtle p-6">
              <div className="flex items-center justify-between mb-5"><h3 className="font-display text-2xl uppercase">Categories</h3><button onClick={resetCategoryForm} className="text-sm text-[#090909]">New Category</button></div>
              <div className="space-y-4">{categories.map((category) => <div key={category.categoryId} className="bg-bg-primary/60 rounded-md border border-border-subtle p-4 flex items-center justify-between gap-4"><div><h4 className="font-semibold capitalize">{category.categoryName}</h4><p className="text-sm text-text-muted">{category.description}</p></div><div className="flex gap-4 text-sm"><button onClick={() => startCategoryEdit(category)} className="text-[#090909]">Edit</button><button onClick={() => void removeCategory(category.categoryId)} className="text-red-400">Delete</button></div></div>)}</div>
            </div>
            <div className="bg-bg-secondary rounded-lg border border-border-subtle p-6">
              <h3 className="font-display text-2xl uppercase mb-5">{editingCategoryId ? 'Edit Category' : 'Create Category'}</h3>
              <form onSubmit={submitCategory} className="space-y-4">
                <div><label className="block text-sm text-text-secondary mb-2">Category Name</label><input value={categoryForm.categoryName} onChange={(e) => setCategoryForm((prev) => ({ ...prev, categoryName: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>
                <div><label className="block text-sm text-text-secondary mb-2">Description</label><textarea value={categoryForm.description} onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" /></div>
                <div className="flex gap-3"><button type="submit" disabled={submitting} className="bg-[#090909] hover:bg-[#242424] disabled:opacity-70 text-white px-6 py-3 rounded-lg font-semibold uppercase text-sm tracking-wider">{editingCategoryId ? 'Update Category' : 'Create Category'}</button>{editingCategoryId && <button type="button" onClick={resetCategoryForm} className="border border-border-subtle px-6 py-3 rounded-lg text-text-secondary">Cancel</button>}</div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-bg-secondary rounded-lg border border-border-subtle p-6">
            <h3 className="font-display text-2xl uppercase mb-5">Editable Public Site Settings</h3>
            <form onSubmit={saveSettings} className="grid md:grid-cols-2 gap-4">
              {Object.entries(settingsForm).map(([key, value]) => (
                <div key={key} className={key === 'hero_subtitle' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm text-text-secondary mb-2">{key.replaceAll('_', ' ')}</label>
                  {key === 'hero_subtitle' ? (
                    <textarea value={value} onChange={(e) => setSettingsForm((prev) => ({ ...prev, [key]: e.target.value }))} rows={4} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" />
                  ) : (
                    <input value={value} onChange={(e) => setSettingsForm((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3" />
                  )}
                </div>
              ))}
              <div className="md:col-span-2">
                <button type="submit" disabled={submitting} className="bg-[#090909] hover:bg-[#242424] disabled:opacity-70 text-white px-6 py-3 rounded-lg font-semibold uppercase text-sm tracking-wider">Save Site Settings</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
