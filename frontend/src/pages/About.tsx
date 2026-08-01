import { motion } from 'framer-motion';
import { Eye, Heart, Target, Zap } from '../lib/icons';
import Newsletter from '../components/Newsletter';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Purpose Driven',
      description: 'Every stitch serves a purpose. We design for movement, comfort, and self-expression.',
    },
    {
      icon: Eye,
      title: 'Vision Forward',
      description: 'We stay ahead of trends while staying true to our roots. Classic silhouettes, modern attitude.',
    },
    {
      icon: Heart,
      title: 'Made With Care',
      description: 'Ethical sourcing and quality craftsmanship are at the core of everything we create.',
    },
    {
      icon: Zap,
      title: 'Fearless Energy',
      description: 'OUTLOOX is for the bold. For those who refuse to blend in and dare to stand out.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 " />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#090909]/10 rounded-full hidden" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-[#090909] text-sm font-bold uppercase tracking-[0.2em] mb-4 block">About Outloox</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-wide mb-6">
              We Are <span className="text-gradient-accent">Outloox</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
              A premium streetwear brand born in India, built for the bold. We create clothing and footwear that help you express your outlook without saying a word.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-lg overflow-hidden"
        >
          <img src="/about/about-hero.svg" alt="OUTLOOX brand identity" className="w-full h-auto object-cover" />
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide mb-6">Our Story</h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                OUTLOOX started with a simple belief: what you wear should amplify who you are. In a world of fast fashion and copy-paste trends, we wanted to build something authentic for the Indian streetwear community.
              </p>
              <p>
                From our first oversized tee to our latest sneaker drop, every product is designed with intention. We obsess over fabric weight, fit, and finish because details matter.
              </p>
              <p>
                Today, OUTLOOX is more than a clothing brand. It is a mindset. A community of creators, dreamers, and doers who wear their outlook with pride.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              ['50K+', 'Happy Customers'],
              ['100+', 'Products'],
              ['25+', 'Cities Served'],
              ['4.8', 'Average Rating'],
            ].map(([value, label]) => (
              <div key={label} className="bg-bg-secondary rounded-lg p-6 text-center">
                <div className="font-display text-4xl font-bold text-[#090909] mb-2">{value}</div>
                <p className="text-sm text-text-muted">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-bg-secondary py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide mb-3">What We Stand For</h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Our values guide every decision we make, from design to delivery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-bg-primary rounded-lg p-6 border border-border-subtle hover:border-[#090909]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#090909]/10 flex items-center justify-center mb-4">
                  <value.icon size={24} className="text-[#090909]" />
                </div>
                <h3 className="font-display text-lg font-bold uppercase mb-2">{value.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
