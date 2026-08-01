import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from '../lib/icons';

interface CollectionCardProps {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  index?: number;
}

export default function CollectionCard({ title, subtitle, image, link, index = 0 }: CollectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="group"
    >
      <Link
        to={link}
        className="relative block aspect-[4/5] rounded-lg overflow-hidden bg-bg-secondary shadow-lg hover:shadow-xl hover:shadow-black/10 transition-shadow duration-500"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-collection.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">{subtitle}</p>
          <h3 className="font-display text-xl font-bold text-text-primary uppercase flex items-center gap-2">
            {title}
            <ArrowRight
              size={18}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
