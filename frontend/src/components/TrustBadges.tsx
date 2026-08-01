import { motion } from 'framer-motion';
import { Gem, RefreshCw, ShieldCheck, TrendingUp, Truck } from '../lib/icons';
import { brandFeatures } from '../lib/data';

const icons = [Gem, TrendingUp, Truck, ShieldCheck, RefreshCw];

export default function TrustBadges() {
  return (
    <section className="py-6 bg-bg-primary border-y border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {brandFeatures.map((feature, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="w-9 h-9 rounded-none bg-transparent border border-border-subtle flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-text-primary">{feature.title}</h4>
                  <p className="text-xs text-text-muted">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
