import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { CartStore } from '../lib/cartStore';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../lib/ThemeContext';
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from '../lib/icons';

interface HeaderProps {
  cart: CartStore;
}

export default function Header({ cart }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { settings } = useSettings();
  const { count: wishlistCount } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/shop?category=men', label: 'Men' },
    { to: '/shop?category=women', label: 'Women' },
    { to: '/shop?category=sneakers', label: 'Sneakers' },
    { to: '/shop', label: 'New Arrivals' },
    { to: '/shop', label: 'Sale' },
    { to: '/about', label: 'About' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 transition-all duration-300 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="bg-black text-white text-[11px] font-semibold uppercase tracking-[0.18em]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-6 overflow-hidden">
          <span className="hidden sm:inline">{settings.announcement_primary}</span>
          <span className="hidden sm:inline">|</span>
          <span>{settings.announcement_secondary}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">{settings.announcement_tertiary}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden md:inline">{settings.announcement_quaternary}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-4 border-b border-border-subtle">
          <button
            onClick={() => setIsMenuOpen((value) => !value)}
            className="lg:hidden p-2 -ml-2 text-text-primary hover:text-[#090909] transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center group shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold tracking-[0.16em] text-text-primary transition-opacity duration-300 group-hover:opacity-70">
              OUTLOOX
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="relative text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors uppercase tracking-[0.08em] group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-text-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-56 bg-transparent border border-border-subtle rounded-none py-1.5 pl-3 pr-9 text-sm text-text-primary placeholder-text-muted focus:border-text-primary transition-colors"
              />
              <button type="submit" className="absolute right-3 text-text-muted hover:text-text-primary transition-colors" aria-label="Search">
                <Search size={16} />
              </button>
            </form>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-text-secondary hover:text-[#090909] hover:bg-text-primary/5 transition-all duration-300"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to="/wishlist" className="hidden sm:flex relative p-2 text-text-secondary hover:text-text-primary transition-colors" aria-label="Wishlist">
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#090909] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/profile" className="flex p-2 text-text-secondary hover:text-text-primary transition-colors" aria-label="Account">
                  <User size={22} />
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    showToast('Logged out successfully.', 'success');
                    navigate('/');
                  }}
                  className="text-xs uppercase tracking-widest text-text-muted hover:text-text-primary"
                >
                  {user?.username}
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex p-2 text-text-secondary hover:text-text-primary transition-colors" aria-label="Login">
                <User size={22} />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 text-text-secondary hover:text-text-primary transition-colors" aria-label="Cart">
              <ShoppingBag size={22} />
              {cart.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#090909] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ">
                  {cart.totalItems > 9 ? '9+' : cart.totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-bg-primary/98 backdrop-blur-lg border-t border-border-subtle overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <form onSubmit={handleSearch} className="flex items-center relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-text-primary/5 border border-border-subtle rounded-lg py-2.5 pl-4 pr-10 text-sm text-text-primary placeholder-text-muted focus:border-[#090909]"
                />
                <button type="submit" className="absolute right-3 text-text-muted hover:text-text-primary" aria-label="Search">
                  <Search size={18} />
                </button>
              </form>

              {navLinks.map((link, index) => (
                <motion.div key={link.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={link.to} className="block py-3 text-base font-medium text-text-secondary hover:text-[#090909] border-b border-border-subtle uppercase tracking-wide transition-colors">
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.05 }}>
                <Link to="/wishlist" className="block py-3 text-base font-medium text-text-secondary hover:text-[#090909] border-b border-border-subtle uppercase tracking-wide transition-colors">
                  Wishlist
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.055 }}>
                <Link to={isAuthenticated ? '/profile' : '/login'} className="block py-3 text-base font-medium text-text-secondary hover:text-[#090909] border-b border-border-subtle uppercase tracking-wide transition-colors">
                  {isAuthenticated ? 'My Account' : 'Login'}
                </Link>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                onClick={toggleTheme}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-text-secondary hover:text-[#090909] border-b border-border-subtle uppercase tracking-wide transition-colors"
              >
                <span>Switch Theme</span>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
