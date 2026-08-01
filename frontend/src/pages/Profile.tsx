import { useEffect, useState } from 'react';
import { changePassword, getProfile, updateProfile } from '../api/profileService';
import { deleteUserAddress, getUserAddresses, setDefaultAddress } from '../api/addressService';
import { getOrders } from '../api/orderService';
import { ApiClientError } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Address, OrderResponse, ProfileResponse } from '../lib/types';
import { formatPrice } from '../lib/data';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'orders' | 'addresses'>('profile');
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [profileData, ordersData, addressData] = await Promise.all([
        getProfile(),
        getOrders(),
        getUserAddresses(),
      ]);
      setProfile(profileData);
      setProfileForm({ username: profileData.username, email: profileData.email });
      setOrders(ordersData.orders || []);
      setAddresses(addressData.addresses || []);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to load profile data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProfile(profileForm);
      showToast(result.message, 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to update profile.', 'error');
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await changePassword(passwordForm);
      showToast(result.message, 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to change password.', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      const result = await deleteUserAddress(addressId);
      showToast(result.message, 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to delete address.', 'error');
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const result = await setDefaultAddress(addressId);
      showToast(result.message, 'success');
      await loadAll();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Failed to update default address.', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-bg-primary pt-32 flex items-center justify-center text-text-muted">Loading profile…</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[260px,1fr] gap-8">
        <aside className="bg-bg-secondary rounded-lg p-6 h-fit border border-border-subtle">
          <div className="w-16 h-16 rounded-full bg-[#090909]/15 text-[#090909] flex items-center justify-center font-display text-2xl mb-4">
            {user?.username?.slice(0, 2).toUpperCase() || 'OX'}
          </div>
          <h1 className="font-display text-2xl uppercase font-bold">{user?.username}</h1>
          <p className="text-text-muted text-sm mb-6">{user?.email}</p>
          <div className="space-y-2">
            {[
              ['profile', 'Profile Information'],
              ['password', 'Change Password'],
              ['orders', 'Order History'],
              ['addresses', 'Saved Addresses'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                  activeTab === key ? 'bg-[#090909] text-white' : 'text-text-secondary hover:bg-text-primary/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={async () => {
              await logout();
              showToast('Logged out successfully.', 'success');
            }}
            className="mt-6 w-full border border-border-subtle py-3 rounded-lg text-sm uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-text-primary/20"
          >
            Logout
          </button>
        </aside>

        <section className="bg-bg-secondary rounded-lg p-6 md:p-8 border border-border-subtle">
          {activeTab === 'profile' && (
            <div>
              <h2 className="font-display text-3xl uppercase font-bold mb-2">Profile Information</h2>
              <p className="text-text-muted mb-8">Update your account details.</p>
              <form onSubmit={saveProfile} className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Username</label>
                  <input
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Role</label>
                  <input disabled value={profile?.role || ''} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3 opacity-70" />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Member Since</label>
                  <input disabled value={profile?.joinDate || ''} className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3 opacity-70" />
                </div>
                <div className="md:col-span-2">
                  <button className="bg-[#090909] hover:bg-[#242424] text-white px-6 py-3 rounded-lg font-semibold uppercase text-sm tracking-wider">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 className="font-display text-3xl uppercase font-bold mb-2">Change Password</h2>
              <p className="text-text-muted mb-8">Keep your account secure.</p>
              <form onSubmit={savePassword} className="grid gap-5 max-w-xl">
                {[
                  ['currentPassword', 'Current Password'],
                  ['newPassword', 'New Password'],
                  ['confirmPassword', 'Confirm New Password'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm text-text-secondary mb-2">{label}</label>
                    <input
                      type="password"
                      value={passwordForm[key as keyof typeof passwordForm]}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3"
                    />
                  </div>
                ))}
                <button className="bg-[#090909] hover:bg-[#242424] text-white px-6 py-3 rounded-lg font-semibold uppercase text-sm tracking-wider w-fit">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="font-display text-3xl uppercase font-bold mb-2">Order History</h2>
              <p className="text-text-muted mb-8">Track all your purchases in one place.</p>
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.orderId} className="bg-bg-primary/60 border border-border-subtle rounded-md p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-sm text-text-muted">Order #{order.orderId}</p>
                        <h3 className="font-semibold text-lg">{formatPrice(order.totalAmount)}</h3>
                        <p className="text-sm text-text-muted">{new Date(order.orderDate).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-[#090909]/15 text-text-primary text-xs uppercase tracking-wider">{order.orderStatus}</span>
                        <span className="px-3 py-1 rounded-full bg-text-primary/5 text-text-secondary text-xs uppercase tracking-wider">{order.paymentStatus}</span>
                        <Link to={`/orders/${order.orderId}`} className="text-sm text-[#090909] hover:text-[#111111] font-medium">View Details</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted">No orders yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="font-display text-3xl uppercase font-bold mb-2">Saved Addresses</h2>
              <p className="text-text-muted mb-8">Manage delivery destinations used at checkout.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div key={address.addressId} className="bg-bg-primary/60 border border-border-subtle rounded-md p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold">{address.fullName}</h3>
                          <p className="text-sm text-text-muted">{address.phone}</p>
                        </div>
                        {address.default && <span className="text-[10px] uppercase tracking-wider bg-[#090909] text-white px-2 py-1 rounded">Default</span>}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{address.addressLine}</p>
                      <p className="text-sm text-text-secondary">{address.city}, {address.state} - {address.pinCode}</p>
                      <p className="text-sm text-text-muted mt-1">{address.country}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        {!address.default && (
                          <button onClick={() => void handleSetDefault(address.addressId)} className="text-[#090909] hover:text-[#111111]">Set Default</button>
                        )}
                        <button onClick={() => void handleDeleteAddress(address.addressId)} className="text-red-400 hover:text-red-300">Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted">No addresses saved yet. Add one during checkout.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
