import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Camera, CreditCard, Globe, Mail, MapPin, MessageCircle, Phone, PlayCircle, RefreshCw, ShieldCheck, Truck } from '../lib/icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <footer className="bg-black text-white border-t border-black">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3"><Truck className="text-white" size={22} /><div><p className="font-semibold text-xs uppercase tracking-wide">Free Shipping</p><p className="text-xs text-white/55">On orders above ₹999</p></div></div>
            <div className="flex items-center gap-3"><RefreshCw className="text-white" size={22} /><div><p className="font-semibold text-xs uppercase tracking-wide">Easy Returns</p><p className="text-xs text-white/55">7-day return policy</p></div></div>
            <div className="flex items-center gap-3"><ShieldCheck className="text-white" size={22} /><div><p className="font-semibold text-xs uppercase tracking-wide">Secure Payment</p><p className="text-xs text-white/55">100% secure checkout</p></div></div>
            <div className="flex items-center gap-3"><CreditCard className="text-white" size={22} /><div><p className="font-semibold text-xs uppercase tracking-wide">COD Available</p><p className="text-xs text-white/55">Pay on delivery</p></div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block"><span className="text-2xl font-extrabold tracking-[0.16em] text-white">OUTLOOX</span></Link>
            <p className="mt-4 text-sm text-white/60 max-w-sm leading-relaxed">Premium streetwear and footwear designed for individuals who create their own path. Wear your outlook.</p>
            <div className="mt-6 flex items-center gap-3">{[Camera, Globe, MessageCircle, PlayCircle].map((Icon, index) => <a key={index} href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all"><Icon size={16} /></a>)}</div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3">{['Men', 'Women', 'Sneakers', 'New Arrivals', 'Sale'].map((item) => { const to = item === 'New Arrivals' || item === 'Sale' ? '/shop' : `/shop?category=${item.toLowerCase()}`; return <li key={item}><Link to={to} className="text-sm text-white/55 hover:text-white transition-colors">{item}</Link></li>; })}</ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-3">{['Contact Us', 'Shipping', 'Returns', 'Size Guide', 'FAQs'].map((item) => <li key={item}><Link to="/about" className="text-sm text-white/55 hover:text-white transition-colors">{item}</Link></li>)}</ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">{['About Us', 'Our Story', 'Privacy Policy', 'Terms & Conditions', 'Careers'].map((item) => <li key={item}><Link to="/about" className="text-sm text-white/55 hover:text-white transition-colors">{item}</Link></li>)}</ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-white/55">
            <a href={`mailto:${settings.footer_email}`} className="flex items-center gap-2 hover:text-white transition-colors"><Mail size={16} /> {settings.footer_email}</a>
            <a href={`tel:${settings.footer_phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:text-white transition-colors"><Phone size={16} /> {settings.footer_phone}</a>
            <span className="flex items-center gap-2"><MapPin size={16} /> {settings.footer_city}</span>
          </div>
          <div className="text-sm text-white/45">© {currentYear} OUTLOOX. All Rights Reserved.</div>
        </div>
      </div>
    </footer>
  );
}
