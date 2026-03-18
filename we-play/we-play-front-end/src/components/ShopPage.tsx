import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';

interface ShopPageProps {
  isDarkMode?: boolean;
}

const merchItems = [
  {
    id: 'hoodie-01',
    name: 'WePlay Performance Hoodie',
    price: '$45',
    tag: 'New',
    accent: 'from-emerald-500/30 to-cyan-500/30'
  },
  {
    id: 'tee-01',
    name: 'WePlay Training Tee',
    price: '$32',
    tag: 'Best Seller',
    accent: 'from-orange-500/30 to-rose-500/30'
  },
  {
    id: 'cap-01',
    name: 'WePlay Athletic Cap',
    price: '$24',
    tag: 'Limited',
    accent: 'from-purple-500/30 to-blue-500/30'
  },
  {
    id: 'shorts-01',
    name: 'WePlay Flex Shorts',
    price: '$38',
    tag: 'New',
    accent: 'from-lime-500/30 to-emerald-500/30'
  },
  {
    id: 'bottle-01',
    name: 'WePlay Hydration Bottle',
    price: '$20',
    tag: 'Popular',
    accent: 'from-sky-500/30 to-indigo-500/30'
  },
  {
    id: 'bag-01',
    name: 'WePlay Training Duffel',
    price: '$48',
    tag: 'Premium',
    accent: 'from-yellow-500/30 to-amber-500/30'
  },
  {
    id: 'headbands-01',
    name: 'WePlay Flex Headbands (2-pack)',
    price: '$16',
    tag: 'New',
    accent: 'from-fuchsia-500/30 to-pink-500/30'
  },
  {
    id: 'wristbands-01',
    name: 'WePlay Grip Wristbands',
    price: '$14',
    tag: 'Popular',
    accent: 'from-teal-500/30 to-emerald-500/30'
  },
  {
    id: 'stickers-01',
    name: 'WePlay Sticker Pack',
    price: '$8',
    tag: 'Accessory',
    accent: 'from-indigo-500/30 to-violet-500/30'
  },
  {
    id: 'phonecase-01',
    name: 'WePlay Impact Phone Case',
    price: '$22',
    tag: 'New',
    accent: 'from-slate-500/30 to-sky-500/30'
  },
  {
    id: 'sportsflags-01',
    name: 'WePlay Sports Flags',
    price: '$18',
    tag: 'Limited',
    accent: 'from-rose-500/30 to-orange-500/30'
  },
  {
    id: 'smartwatch-01',
    name: 'WePlay Sport Smartwatch',
    price: '$49',
    tag: 'Featured',
    accent: 'from-cyan-500/30 to-blue-500/30'
  },
  {
    id: 'elasticbands-01',
    name: 'WePlay Motion Elastic Bands (8-pack)',
    price: '$36',
    tag: 'Tech',
    accent: 'from-green-500/30 to-lime-500/30'
  }
];

const ShopPage: React.FC<ShopPageProps> = ({ isDarkMode = true }) => {
  const theme = isDarkMode ? {
    bg: 'bg-black',
    surface: 'bg-white/5',
    surfaceHover: 'hover:bg-white/10',
    border: 'border-white/10',
    borderLight: 'border-white/20',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSecondary: 'text-white/50',
    textTertiary: 'text-white/60',
    button: 'bg-white/10 border border-white/20 hover:bg-white/20',
    buttonPrimary: 'bg-white text-black hover:bg-white/90',
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    surfaceHover: 'hover:bg-gray-50',
    border: 'border-gray-200',
    borderLight: 'border-gray-300',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textSecondary: 'text-gray-500',
    textTertiary: 'text-gray-500',
    button: 'bg-white border border-gray-300 hover:bg-gray-100',
    buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} text-xs`}>
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-10">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <p className={`text-[11px] uppercase tracking-[0.4em] ${theme.textSecondary}`}>WePlay Merch</p>
            <h1 className="text-3xl md:text-4xl font-light mt-3">Shop the WePlay Collection</h1>
            <p className={`${theme.textMuted} max-w-2xl mt-4 text-xs`}>
              Performance gear, training essentials, and community favorites. Refresh the storefront with new drops
              anytime — this page is ready for your real products.
            </p>
          </div>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme.button} transition`}>
            <ShoppingBag size={16} />
            <span className="text-xs">View Cart</span>
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {merchItems.map((item) => (
            <div
              key={item.id}
              className={`${theme.surface} border ${theme.border} rounded-3xl p-5 ${theme.surfaceHover} transition`}
            >
              <div className={`h-44 rounded-2xl bg-gradient-to-br ${item.accent} border ${theme.border}`} />
              <div className="flex items-center justify-between mt-4">
                <span className={`text-[11px] uppercase tracking-[0.2em] ${theme.textTertiary}`}>{item.tag}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} />
                  <span className="text-[11px]">4.9</span>
                </div>
              </div>
              <h3 className={`text-sm font-medium mt-2 ${theme.text}`}>{item.name}</h3>
              <div className="flex items-center justify-between mt-4">
                <span className={`text-base font-semibold ${theme.text}`}>{item.price}</span>
                <button className={`px-4 py-2 rounded-full ${theme.buttonPrimary} text-xs font-medium transition`}>
                  Add to bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
