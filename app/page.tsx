'use client';

import { useState, useEffect } from 'react';

// Product type definition
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  tagline: string;
  description: string;
  isAvailable: boolean;
  image: string;
  aspect: string;
  colorBgLight: string;
  colorBgDark: string;
}

// Order confirmation type definition
interface OrderReceipt {
  orderId: string;
  items: { id: number; name: string; price: number; qty: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customerName: string;
  address: string;
  city: string;
  phone: string;
  paymentMethod: string;
}

// Ziel Store Product Data
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Ziel King Coconut Wine',
    category: 'Wines',
    price: 32.00,
    tagline: 'Batch No. 04 — Artisanal Fermentation',
    description: 'Slow-fermented naturally from fresh king coconut nectar. Features rich floral aromatics, subtle caramel warmth, and a smooth, balanced crisp finish. Best served chilled.',
    isAvailable: true,
    image: '/images/wine.jpg',
    aspect: 'aspect-[4/5]',
    colorBgLight: 'bg-[#EFECE6]',
    colorBgDark: 'bg-[#22211F]',
  },
  {
    id: 2,
    name: 'Ziel Grit Heavy Duty Soap',
    category: 'Soaps',
    price: 14.00,
    tagline: 'Mechanics Formula — Grease & Oil Removal',
    description: 'Specially formulated cold-process soap designed to lift tough industrial grease, engine oil, rust, and dirt without drying out skin. Infused with natural exfoliants and pumice.',
    isAvailable: true,
    image: '/images/soap.jpg',
    aspect: 'aspect-[1/1]',
    colorBgLight: 'bg-[#EAE8E3]',
    colorBgDark: 'bg-[#252422]',
  },
  {
    id: 3,
    name: 'Botanical Cold-Process Soap',
    category: 'Soaps',
    price: 10.00,
    tagline: 'Natural Oils & Hydrating Lipids',
    description: 'Handcrafted moisturizing soap made with virgin coconut oil, essential botanical extracts, and rich nourishing lipids for gentle daily skin cleansing.',
    isAvailable: true,
    image: '/images/cleanser.jpg',
    aspect: 'aspect-[4/5]',
    colorBgLight: 'bg-[#F2EFEA]',
    colorBgDark: 'bg-[#1E1D1B]',
  },
  {
    id: 4,
    name: 'Reserve Coconut Vintage Wine',
    category: 'Wines',
    price: 48.00,
    tagline: 'Aged 12 Months — Limited Edition',
    description: 'A premium limited-edition reserve vintage aged in oak casks for 12 months. Delivers complex notes of toasted coconut, vanilla, and oak undertones.',
    isAvailable: true,
    image: '/images/wine.jpg',
    aspect: 'aspect-[1/1]',
    colorBgLight: 'bg-[#EBE7DF]',
    colorBgDark: 'bg-[#22211F]',
  },
  {
    id: 5,
    name: 'Industrial Hand Cleanser Bar',
    category: 'Soaps',
    price: 12.00,
    tagline: 'Exfoliating Pumice & Citrus Oil',
    description: 'Heavy-duty exfoliating bar infused with organic orange peel oils and fine volcanic pumice. Effortlessly dissolves inks, paints, and heavy grime.',
    isAvailable: true,
    image: '/images/soap.jpg',
    aspect: 'aspect-[4/5]',
    colorBgLight: 'bg-[#EFECE6]',
    colorBgDark: 'bg-[#252422]',
  },
  {
    id: 6,
    name: 'Ziel Store Signature Gift Set',
    category: 'Sets',
    price: 65.00,
    tagline: 'Artisanal Wine & Cleanser Duo',
    description: 'Our flagship signature bundle featuring 1 bottle of Batch No. 04 King Coconut Wine alongside 2 bars of handcrafted Ziel soaps in custom gift packaging.',
    isAvailable: true,
    image: '/images/wine.jpg',
    aspect: 'aspect-[16/10]',
    colorBgLight: 'bg-[#E8E4DC]',
    colorBgDark: 'bg-[#282724]',
  },
];

const CATEGORIES = ['All Works', 'Wines', 'Soaps', 'Sets'];

export default function Home() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Works');

  // Commerce states
  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal states
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  // Account / Login states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Checkout Flow States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Colombo',
    paymentMethod: 'cod',
  });
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  // --- LOCALSTORAGE PERSISTENCE HOOKS ---
  useEffect(() => {
    // Load saved theme & cart from browser storage on mount
    const savedCart = localStorage.getItem('ziel_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    const savedTheme = localStorage.getItem('ziel_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // Persist cart updates to localStorage
    localStorage.setItem('ziel_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // Persist theme choice to localStorage
    localStorage.setItem('ziel_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Filter products
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'All Works' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenProduct = (product: Product) => {
    setActiveProduct(product);
    setModalQuantity(1);
  };

  const handleCloseProduct = () => {
    setActiveProduct(null);
  };

  const addToCart = (product: Product, qtyToAdd: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qtyToAdd } : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, price: product.price, qty: qtyToAdd }];
    });
    setIsCartOpen(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    const nameFromEmail = emailInput.split('@')[0];
    setUser({ email: emailInput, name: nameFromEmail });
    setIsAuthOpen(false);
    setEmailInput('');
    setPasswordInput('');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  // Calculations
  const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingFee = subtotal > 0 ? 5.00 : 0.00;
  const grandTotal = subtotal + shippingFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNum = `ZIEL-${randomNum}`;

    const newReceipt: OrderReceipt = {
      orderId: orderNum,
      items: [...cart],
      subtotal,
      shippingFee,
      total: grandTotal,
      customerName: shippingForm.fullName || user?.name || 'Valued Customer',
      address: shippingForm.address,
      city: shippingForm.city,
      phone: shippingForm.phone,
      paymentMethod: 
        shippingForm.paymentMethod === 'cod' ? 'Cash on Delivery' :
        shippingForm.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Direct Bank Transfer',
    };

    setReceipt(newReceipt);
    setCart([]);
    setIsCartOpen(false);
    setCheckoutStep('success');
  };

  // Theme styling helpers
  const bgMain = isDarkMode ? 'bg-[#141413] text-[#F0EFEA]' : 'bg-[#FAF9F5] text-[#1C1B1A]';
  const headerBg = isDarkMode ? 'bg-[#141413]/80 border-stone-800' : 'bg-[#FAF9F5]/80 border-stone-200/60';
  const cardBorder = isDarkMode ? 'border-stone-800 hover:border-stone-700' : 'border-stone-200/40 hover:border-stone-300';
  const modalBg = isDarkMode ? 'bg-[#1A1918] border-stone-800 text-[#F0EFEA]' : 'bg-[#FAF9F5] border-stone-200/80 text-[#1C1B1A]';
  const pillActive = isDarkMode ? 'bg-[#F0EFEA] text-[#141413]' : 'bg-stone-900 text-[#FAF9F5]';
  const pillInactive = isDarkMode ? 'bg-stone-800/60 text-stone-300 hover:bg-stone-800' : 'bg-stone-200/50 text-stone-600 hover:bg-stone-200';

  return (
    <main className={`min-h-screen ${bgMain} font-sans antialiased transition-colors duration-300 selection:bg-stone-300 selection:text-stone-900 scroll-smooth`}>
      {/* Header Bar */}
      <header className={`sticky top-0 z-30 ${headerBg} backdrop-blur-md border-b px-6 sm:px-12 py-4 flex items-center justify-between`}>
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Ziel Store Logo" 
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-xl font-medium tracking-[-0.04em] uppercase">
            ZIEL<span className={`font-light ml-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>STORE</span>
          </span>
        </div>

        {/* Center Navigation */}
        <nav className={`hidden md:flex items-center space-x-10 text-xs font-medium uppercase tracking-widest ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
          <a href="#works" className="hover:text-current transition-colors">Catalog</a>
          <a href="#about" className="hover:text-current transition-colors">Craftsmanship</a>
          <a href="#contact" className="hover:text-current transition-colors">Contact</a>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
            className={`p-2.5 rounded-full border transition-all ${
              isDarkMode 
                ? 'bg-stone-800/80 border-stone-700 text-amber-300 hover:bg-stone-700' 
                : 'bg-stone-200/60 border-stone-300/80 text-stone-700 hover:bg-stone-300'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-mono px-3 py-1.5 rounded-full border ${isDarkMode ? 'border-stone-700 bg-stone-800' : 'border-stone-300 bg-stone-100'}`}>
                👤 {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] uppercase font-mono tracking-wider text-stone-400 hover:text-stone-600 underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className={`text-xs uppercase tracking-widest font-medium px-4 py-2 rounded-full border transition-all ${
                isDarkMode 
                  ? 'border-stone-700 hover:border-stone-500 text-stone-200' 
                  : 'border-stone-300 hover:border-stone-400 text-stone-800'
              }`}
            >
              Account
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className={`group flex items-center space-x-3 text-xs font-medium uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-sm ${
              isDarkMode 
                ? 'bg-[#F0EFEA] text-[#141413] hover:bg-white' 
                : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
            }`}
          >
            <span>Bag</span>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono transition-colors ${
              isDarkMode ? 'bg-stone-300 text-stone-900' : 'bg-stone-700 text-[#FAF9F5]'
            }`}>
              {totalCartItems}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Showcase Header */}
      <section className="px-6 sm:px-12 pt-20 pb-12 max-w-7xl mx-auto">
        <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-4 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
          Handcrafted Essentials & Fermentations
        </p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[1.08] max-w-4xl">
          Thoughtfully created products built with <span className={`italic font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>precision & care.</span>
        </h1>
      </section>

      {/* Category Pills & Search Input Bar */}
      <section id="works" className="px-6 sm:px-12 max-w-7xl mx-auto pb-10">
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-6 ${
          isDarkMode ? 'border-stone-800' : 'border-stone-200/80'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat ? pillActive : pillInactive
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 text-xs rounded-full border focus:outline-none transition-colors ${
                isDarkMode 
                  ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-stone-500' 
                  : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-800'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="px-6 sm:px-12 max-w-7xl mx-auto pb-24">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-stone-400 text-sm">
            No products found matching "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="group flex flex-col justify-between cursor-pointer"
              >
                <div className={`relative w-full ${product.aspect} ${isDarkMode ? product.colorBgDark : product.colorBgLight} rounded-2xl overflow-hidden border ${cardBorder} p-4 flex flex-col justify-between transition-all duration-500 group-hover:shadow-xl`}>
                  <div className="flex justify-between items-start z-10">
                    <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm ${
                      isDarkMode ? 'bg-stone-900/80 text-stone-400' : 'bg-[#FAF9F5]/80 text-stone-500'
                    }`}>
                      {product.category}
                    </span>
                    <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md backdrop-blur-sm ${
                      isDarkMode ? 'bg-stone-900/80 text-stone-300' : 'bg-[#FAF9F5]/80 text-stone-700'
                    }`}>
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-md rounded-xl transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProduct(product);
                    }}
                    className={`relative z-10 w-full text-xs uppercase tracking-widest py-3 rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm ${
                      isDarkMode ? 'bg-stone-100/90 text-stone-900' : 'bg-stone-900/90 text-[#FAF9F5]'
                    }`}
                  >
                    View Details
                  </button>
                </div>

                <div className="mt-4 px-1 flex justify-between items-baseline">
                  <div>
                    <h3 className="text-base font-medium transition-colors">
                      {product.name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                      {product.tagline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- CRAFTSMANSHIP & STORY SECTION (#about) --- */}
      <section id="about" className={`py-20 px-6 sm:px-12 border-t ${isDarkMode ? 'border-stone-800 bg-[#171615]' : 'border-stone-200/80 bg-[#F4F2EC]'}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
            Behind The Brand
          </p>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-12 max-w-3xl">
            Artisanal formulation meeting raw physical chemistry.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-[#FAF9F5] border-stone-200'}`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-900/10 text-amber-800 flex items-center justify-center text-xl font-mono mb-6">
                🌴
              </div>
              <h3 className="text-xl font-medium mb-3">Natural King Coconut Fermentation</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Ziel King Coconut Wine is born from small-batch natural fermentations of pure, unrefined king coconut nectar. Through meticulous temperature control and physical chemistry precision, we transform native botanical sugars into a refined golden wine with natural floral warmth and balanced acidity.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-[#FAF9F5] border-stone-200'}`}>
              <div className="w-12 h-12 rounded-2xl bg-stone-800/10 text-stone-800 flex items-center justify-center text-xl font-mono mb-6">
                🧼
              </div>
              <h3 className="text-xl font-medium mb-3">Ziel Grit Mechanics Formula</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Engineered for hands that build, repair, and create. Ziel Grit combines cold-process saponified lipid bars with fine volcanic pumice and citrus oils. Designed specifically to dissolve stubborn industrial grease, heavy motor oil, rust particles, and printer ink without harsh synthetic detergents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION (#contact) --- */}
      <section id="contact" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
              Get In Touch
            </p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-4">
              Direct Inquiries & Custom Batch Orders
            </h2>
            <p className={`text-xs leading-relaxed max-w-md ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Have questions regarding bulk artisanal wine reservations, wholesale bar stock, or private branding requests? Send us a direct note.
            </p>

            <div className="mt-8 space-y-3 text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="text-stone-400">Location:</span>
                <span>Colombo & Katunayake, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-stone-400">Email:</span>
                <span>inquiries@zielstore.com</span>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border ${modalBg}`}>
            {contactSubmitted ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                  ✓
                </div>
                <h4 className="text-lg font-medium">Message Received</h4>
                <p className="text-xs text-stone-400 mt-1">Thank you. The Ziel team will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                  }`}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* --- PRODUCT DETAILS MODAL --- */}
      {activeProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-opacity"
          onClick={handleCloseProduct}
        >
          <div 
            className={`${modalBg} rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative border`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseProduct}
              className={`absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                isDarkMode ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              }`}
            >
              ✕
            </button>

            <div className={`w-full md:w-1/2 ${isDarkMode ? activeProduct.colorBgDark : activeProduct.colorBgLight} p-8 flex items-center justify-center min-h-[280px] md:min-h-[420px]`}>
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="max-h-[320px] w-auto object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-md ${
                    isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-200/60 text-stone-600'
                  }`}>
                    {activeProduct.category}
                  </span>
                  <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-md ${
                    activeProduct.isAvailable
                      ? isDarkMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'
                      : isDarkMode ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {activeProduct.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <h2 className="text-2xl font-medium tracking-tight">
                  {activeProduct.name}
                </h2>
                <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {activeProduct.tagline}
                </p>

                <div className="mt-4 text-2xl font-mono font-semibold">
                  ${activeProduct.price.toFixed(2)}
                  <span className={`text-xs font-sans font-normal ml-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>/ item</span>
                </div>

                <p className={`mt-4 text-xs leading-relaxed border-t pt-4 ${
                  isDarkMode ? 'border-stone-800 text-stone-300' : 'border-stone-200/80 text-stone-600'
                }`}>
                  {activeProduct.description}
                </p>
              </div>

              <div className={`mt-8 border-t pt-5 ${isDarkMode ? 'border-stone-800' : 'border-stone-200/80'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs uppercase font-medium tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    Select Quantity
                  </span>

                  <div className={`flex items-center space-x-3 border rounded-full px-3 py-1.5 shadow-sm ${
                    isDarkMode ? 'border-stone-700 bg-stone-800' : 'border-stone-300 bg-white'
                  }`}>
                    <button
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      className="hover:opacity-60 text-sm font-bold w-5 h-5 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono font-medium min-w-[20px] text-center">
                      {modalQuantity}
                    </span>
                    <button
                      onClick={() => setModalQuantity((q) => q + 1)}
                      className="hover:opacity-60 text-sm font-bold w-5 h-5 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(activeProduct, modalQuantity);
                    handleCloseProduct();
                  }}
                  disabled={!activeProduct.isAvailable}
                  className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-between px-6 shadow-md ${
                    isDarkMode 
                      ? 'bg-stone-100 text-stone-900 hover:bg-white disabled:bg-stone-800 disabled:text-stone-600' 
                      : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800 disabled:bg-stone-300'
                  }`}
                >
                  <span>Add {modalQuantity} to Bag</span>
                  <span className="font-mono font-bold">
                    ${(activeProduct.price * modalQuantity).toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACCOUNT / LOGIN MODAL --- */}
      {isAuthOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-opacity"
          onClick={() => setIsAuthOpen(false)}
        >
          <div 
            className={`${modalBg} rounded-3xl max-w-md w-full p-8 shadow-2xl relative border`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAuthOpen(false)}
              className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-200 text-stone-600'
              }`}
            >
              ✕
            </button>

            <div className="flex border-b mb-6 pb-2 space-x-6">
              <button
                onClick={() => setAuthMode('signin')}
                className={`text-sm uppercase tracking-wider font-medium pb-2 border-b-2 transition-all ${
                  authMode === 'signin' 
                    ? isDarkMode ? 'border-stone-100 text-stone-100' : 'border-stone-900 text-stone-900' 
                    : 'border-transparent text-stone-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`text-sm uppercase tracking-wider font-medium pb-2 border-b-2 transition-all ${
                  authMode === 'signup' 
                    ? isDarkMode ? 'border-stone-100 text-stone-100' : 'border-stone-900 text-stone-900' 
                    : 'border-transparent text-stone-400'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500' : 'bg-white border-stone-300 text-stone-900 focus:border-stone-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500' : 'bg-white border-stone-300 text-stone-900 focus:border-stone-800'
                  }`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all mt-4 ${
                  isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                }`}
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md ${modalBg} h-full shadow-2xl p-8 flex flex-col justify-between border-l`}>
            <div>
              <div className={`flex items-center justify-between border-b pb-5 ${isDarkMode ? 'border-stone-800' : 'border-stone-200/80'}`}>
                <h2 className="text-lg font-medium uppercase tracking-wider">
                  Your Shopping Bag ({totalCartItems})
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-stone-400 hover:text-current text-sm p-1"
                >
                  ✕ Close
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center text-stone-400 text-sm">
                  Your bag is currently empty.
                </div>
              ) : (
                <div className={`divide-y max-h-[55vh] overflow-y-auto my-4 pr-2 ${isDarkMode ? 'divide-stone-800' : 'divide-stone-200/60'}`}>
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="text-xs text-stone-400 font-mono mt-0.5">
                          ${item.price.toFixed(2)} × {item.qty}
                        </p>
                      </div>
                      <span className="text-sm font-mono font-medium">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`border-t pt-6 ${isDarkMode ? 'border-stone-800' : 'border-stone-200/80'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-widest text-stone-400">Subtotal</span>
                <span className="text-sm font-mono font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs uppercase tracking-widest text-stone-400">Est. Shipping</span>
                <span className="text-sm font-mono font-medium">${shippingFee.toFixed(2)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutStep('details');
                  setIsCheckoutOpen(true);
                }}
                className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-stone-100 text-stone-900 hover:bg-white disabled:bg-stone-800 disabled:text-stone-600' 
                    : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800 disabled:bg-stone-300'
                }`}
              >
                Proceed to Checkout (${grandTotal.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CHECKOUT MODAL & ORDER CONFIRMATION --- */}
      {isCheckoutOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-opacity overflow-y-auto"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div 
            className={`${modalBg} rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border my-8`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-200 text-stone-600'
              }`}
            >
              ✕
            </button>

            {checkoutStep === 'details' ? (
              <div>
                <h2 className="text-xl font-medium uppercase tracking-wider mb-1">
                  Checkout & Shipping
                </h2>
                <p className={`text-xs mb-6 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  Please enter your delivery address and payment preference.
                </p>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +94 77 123 4567"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Street address, house/apartment number..."
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                      City / Region
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-2">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cod', label: 'Cash on Delivery' },
                        { id: 'card', label: 'Card Payment' },
                        { id: 'bank', label: 'Bank Transfer' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setShippingForm({ ...shippingForm, paymentMethod: method.id })}
                          className={`py-3 px-2 rounded-xl text-[10px] uppercase tracking-wider border font-medium transition-all ${
                            shippingForm.paymentMethod === method.id
                              ? isDarkMode ? 'bg-stone-100 text-stone-900 border-stone-100' : 'bg-stone-900 text-[#FAF9F5] border-stone-900'
                              : isDarkMode ? 'border-stone-800 text-stone-400 hover:border-stone-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border my-4 ${isDarkMode ? 'border-stone-800 bg-stone-900/50' : 'border-stone-200 bg-stone-100/60'}`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-400">Subtotal ({totalCartItems} items):</span>
                      <span className="font-mono">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-stone-400">Flat Shipping:</span>
                      <span className="font-mono">${shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t pt-2 border-stone-300/40">
                      <span>Total Amount:</span>
                      <span className="font-mono text-emerald-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                      isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                    }`}
                  >
                    Confirm & Place Order (${grandTotal.toFixed(2)})
                  </button>
                </form>
              </div>
            ) : (
              receipt && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    ✓
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 bg-emerald-100/60 px-3 py-1 rounded-md">
                    Order Confirmed
                  </span>
                  <h2 className="text-2xl font-medium tracking-tight mt-3">
                    Thank you for your order!
                  </h2>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    Order Ref: <span className="font-mono font-semibold text-current">{receipt.orderId}</span>
                  </p>

                  <div className={`my-6 text-left p-5 rounded-2xl border ${isDarkMode ? 'border-stone-800 bg-stone-900/50' : 'border-stone-200 bg-stone-100/50'}`}>
                    <h4 className="text-xs uppercase tracking-wider font-semibold mb-3 border-b pb-2 border-stone-300/30">
                      Order Summary
                    </h4>
                    <div className="divide-y divide-stone-300/20 max-h-36 overflow-y-auto mb-4">
                      {receipt.items.map((item) => (
                        <div key={item.id} className="py-2 flex justify-between text-xs">
                          <span>{item.name} <span className="text-stone-400">x{item.qty}</span></span>
                          <span className="font-mono">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-stone-300/40 pt-3 text-xs space-y-1">
                      <div className="flex justify-between text-stone-400">
                        <span>Delivery to:</span>
                        <span className="text-current font-medium">{receipt.customerName} ({receipt.city})</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Payment Method:</span>
                        <span className="text-current font-medium">{receipt.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-2 text-emerald-600">
                        <span>Total Paid:</span>
                        <span className="font-mono">${receipt.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCheckoutStep('details');
                    }}
                    className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                      isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                    }`}
                  >
                    Back to Catalog
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t py-12 px-6 sm:px-12 text-xs tracking-wider ${
        isDarkMode ? 'border-stone-800 bg-[#0F0E0E] text-stone-500' : 'border-stone-200/80 bg-[#F5F3ED] text-stone-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} ZIEL STORE. All rights reserved.</div>
          <div className="flex space-x-6 uppercase tracking-widest">
            <a href="#" className="hover:text-current">Instagram</a>
            <a href="#about" className="hover:text-current">Craftsmanship</a>
            <a href="#contact" className="hover:text-current">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}