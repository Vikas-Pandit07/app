import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Send } from '../lib/icons';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-bg-secondary border-y border-border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide mb-4">
            Join The Outloox Community
          </h2>
          <p className="text-text-muted mb-8 max-w-xl mx-auto">
            Get 10% off your first order and exclusive access to new drops, limited editions, and member-only offers.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-bg-primary border border-border-subtle rounded-sm px-4 py-3 text-text-primary placeholder-text-muted focus:border-text-primary transition-colors"
            />
            <button
              type="submit"
              disabled={subscribed}
              className="bg-black hover:bg-[#242424] text-white font-semibold px-6 py-3 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {subscribed ? (
                <>
                  <Check size={18} /> Subscribed
                </>
              ) : (
                <>
                  Subscribe <Send size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
