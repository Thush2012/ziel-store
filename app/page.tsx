'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
  specs: { label: string; value: string }[];
}

// Order receipt type definition
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

// Historic Order type definition
interface PastOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  shipping_fee: number;
  payment_method: string;
  shipping_address: string;
  city: string;
  phone: string;
}

// Currency definition & exchange rates (Base: USD)
type Currency = 'USD' | 'LKR' | 'EUR' | 'GBP';

interface CurrencyConfig {
  symbol: string;
  rate: number;
  decimals: number;
}

const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: { symbol: '$', rate: 1.0, decimals: 2 },
  LKR: { symbol: 'Rs. ', rate: 300.0, decimals: 0 },
  EUR: { symbol: '€', rate: 0.92, decimals: 2 },
  GBP: { symbol: '£', rate: 0.78, decimals: 2 },
};

// Ziel Store Default / Fallback Product Data
const INITIAL_PRODUCTS: Product[] = [
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
    specs: [
      { label: 'Volume', value: '750 ml' },
      { label: 'ABV', value: '12.5%' },
      { label: 'Origin', value: 'Sri Lanka' },
      { label: 'Serving Temp', value: '8°C - 10°C' },
    ],
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
    specs: [
      { label: 'Weight', value: '180g bar' },
      { label: 'Key Ingredient', value: 'Volcanic Pumice & Citrus Oil' },
      { label: 'Process', value: 'Cold-Process Saponification' },
      { label: 'Best For', value: 'Mechanics, Printers, Artisans' },
    ],
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
    specs: [
      { label: 'Weight', value: '150g bar' },
      { label: 'Scent', value: 'Wild Herbal & Coconut' },
      { label: 'Skin Type', value: 'All / Sensitive' },
    ],
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
    specs: [
      { label: 'Volume', value: '750 ml' },
      { label: 'ABV', value: '14.0%' },
      { label: 'Aging', value: '12 Months Cask' },
    ],
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
    specs: [
      { label: 'Weight', value: '160g bar' },
      { label: 'Exfoliating Level', value: 'High' },
    ],
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
    specs: [
      { label: 'Includes', value: '1x Wine, 2x Soap Bars' },
      { label: 'Packaging', value: 'Matte Gift Box' },
    ],
  },
];

const CATEGORIES = ['All Works', 'Wines', 'Soaps', 'Sets'];

const FAQS = [
  {
    q: 'How is Ziel King Coconut Wine produced?',
    a: 'Our wine is naturally fermented from 100% pure king coconut nectar harvested in Sri Lanka. We strictly avoid artificial additives, preserving natural floral and caramel aromatic notes.',
  },
  {
    q: 'What makes Ziel Grit Soap effective against industrial grease?',
    a: 'Ziel Grit incorporates real volcanic pumice for physical exfoliation paired with natural citrus oils that break down heavy petroleum grease, rust, and printer ink.',
  },
  {
    q: 'What are your delivery timelines within Sri Lanka?',
    a: 'Orders are dispatched within 24 hours. Delivery takes 1–3 business days via registered courier across all major cities.',
  },
];

export default function Home() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic Products State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Currency State
  const [currency, setCurrency] = useState<Currency>('USD');

  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Works');
  const [sortBy, setSortBy] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');

  // Commerce states
  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Supabase Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Order History States
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<PastOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

  // Format price helper according to chosen currency
  const formatPrice = (amountInUsd: number) => {
    const { symbol, rate, decimals } = CURRENCIES[currency];
    const converted = amountInUsd * rate;
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  // --- SUPABASE AUTH SESSION LISTENER ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Customer',
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Customer',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- FETCH PRODUCTS FROM SUPABASE ON MOUNT ---
  useEffect(() => {
    async function fetchSupabaseProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true);

        if (error) {
          console.error('Supabase fetch error:', error);
        } else if (data && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category || 'Wines',
            price: Number(item.price),
            tagline: item.tagline || '',
            description: item.description || '',
            isAvailable: item.is_available,
            image: item.image_url || '/images/wine.jpg',
            aspect: 'aspect-[4/5]',
            colorBgLight: 'bg-[#EFECE6]',
            colorBgDark: 'bg-[#22211F]',
            specs: [
              { label: 'Stock', value: `${item.stock_qty || 0} units` },
            ],
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load products from database:', err);
      }
    }

    fetchSupabaseProducts();
  }, []);

  // Fetch Order History for Authenticated User
  const fetchUserOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    setIsOrdersOpen(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch orders:', error);
        showNotification('Unable to fetch orders');
      } else if (data) {
        setUserOrders(data as PastOrder[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // LocalStorage persistence hooks
  useEffect(() => {
    const savedCart = localStorage.getItem('ziel_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    const savedTheme = localStorage.getItem('ziel_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    const savedCurrency = localStorage.getItem('ziel_currency') as Currency;
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ziel_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ziel_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('ziel_currency', currency);
  }, [currency]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter & Sort products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All Works' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'low-to-high') return a.price - b.price;
    if (sortBy === 'high-to-low') return b.price - a.price;
    return 0;
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
    showNotification(`Added ${qtyToAdd}x ${product.name} to bag`);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
          options: {
            data: { full_name: emailInput.split('@')[0] },
          },
        });

        if (error) {
          showNotification(`Sign Up Error: ${error.message}`);
        } else {
          showNotification('Registration successful! You are signed in.');
          setIsAuthOpen(false);
          setEmailInput('');
          setPasswordInput('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput,
        });

        if (error) {
          showNotification(`Sign In Error: ${error.message}`);
        } else {
          showNotification('Welcome back!');
          setIsAuthOpen(false);
          setEmailInput('');
          setPasswordInput('');
        }
      }
    } catch (err: any) {
      showNotification(err?.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOrdersOpen(false);
    showNotification('Signed out successfully');
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

  // Save Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNum = `ZIEL-${randomNum}`;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNum,
            user_id: user ? user.id : null,
            total_amount: grandTotal,
            shipping_fee: shippingFee,
            payment_method: shippingForm.paymentMethod,
            shipping_address: shippingForm.address,
            city: shippingForm.city,
            phone: shippingForm.phone,
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error('Order saving error:', orderError);
        showNotification(`Order Error: ${orderError.message}`);
        return;
      }

      if (orderData) {
        const orderItemsPayload = cart.map((item) => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.qty,
          unit_price: item.price,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
        if (itemsError) {
          console.error('Line items saving error:', itemsError);
        }
      }
    } catch (err) {
      console.error('Order submission failed:', err);
    }

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

  const bgMain = isDarkMode ? 'bg-[#141413] text-[#F0EFEA]' : 'bg-[#FAF9F5] text-[#1C1B1A]';
  const headerBg = isDarkMode ? 'bg-[#141413]/80 border-stone-800' : 'bg-[#FAF9F5]/80 border-stone-200/60';
  const cardBorder = isDarkMode ? 'border-stone-800 hover:border-stone-700' : 'border-stone-200/40 hover:border-stone-300';
  const modalBg = isDarkMode ? 'bg-[#1A1918] border-stone-800 text-[#F0EFEA]' : 'bg-[#FAF9F5] border-stone-200/80 text-[#1C1B1A]';
  const pillActive = isDarkMode ? 'bg-[#F0EFEA] text-[#141413]' : 'bg-stone-900 text-[#FAF9F5]';
  const pillInactive = isDarkMode ? 'bg-stone-800/60 text-stone-300 hover:bg-stone-800' : 'bg-stone-200/50 text-stone-600 hover:bg-stone-200';

  return (
    <main className={`min-h-screen ${bgMain} font-sans antialiased transition-colors duration-300 selection:bg-stone-300 selection:text-stone-900 scroll-smooth`}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-3 rounded-2xl shadow-xl text-xs font-medium tracking-wide flex items-center space-x-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className={`py-1.5 px-4 text-center text-[10px] uppercase font-mono tracking-widest border-b ${
        isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-600'
      }`}>
        Batch No. 04 Now Available • Complimentary Island-Wide Shipping Over {formatPrice(50)}
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-30 ${headerBg} backdrop-blur-md border-b px-4 sm:px-12 py-3 flex items-center justify-between gap-2`}>
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <img 
            src="/logo.png" 
            alt="Ziel Store Logo" 
            className="h-6 sm:h-8 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="text-sm sm:text-lg font-bold tracking-[0.05em] uppercase whitespace-nowrap">
            ZIEL<span className={`font-light ml-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>STORE</span>
          </span>
        </div>

        {/* Center Nav */}
        <nav className={`hidden md:flex items-center space-x-10 text-xs font-medium uppercase tracking-widest ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
          <a href="#works" className="hover:text-current transition-colors">Catalog</a>
          <a href="#about" className="hover:text-current transition-colors">Craftsmanship</a>
          <a href="#faq" className="hover:text-current transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-current transition-colors">Contact</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
            className={`p-1.5 sm:p-2 rounded-full border transition-all flex items-center justify-center shrink-0 ${
              isDarkMode 
                ? 'bg-stone-800 border-stone-700 text-amber-300 hover:bg-stone-700' 
                : 'bg-stone-200/70 border-stone-300 text-stone-700 hover:bg-stone-300'
            }`}
          >
            <span className="text-xs sm:text-sm leading-none">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-1">
              <button
                onClick={fetchUserOrders}
                className={`text-[10px] sm:text-xs font-mono px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border max-w-[90px] sm:max-w-none truncate hover:opacity-80 transition-opacity ${isDarkMode ? 'border-stone-700 bg-stone-800 text-stone-200' : 'border-stone-300 bg-stone-100 text-stone-800'}`}
                title="Click to view your orders"
              >
                👤 {user.name} (Orders)
              </button>
              <button
                onClick={handleLogout}
                className="text-[9px] uppercase font-mono text-stone-400 hover:text-stone-600 underline px-1"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all ${
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
            className={`group flex items-center space-x-1.5 sm:space-x-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shadow-sm ${
              isDarkMode 
                ? 'bg-[#F0EFEA] text-[#141413] hover:bg-white' 
                : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
            }`}
          >
            <span>Bag</span>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-mono transition-colors ${
              isDarkMode ? 'bg-stone-300 text-stone-900' : 'bg-stone-700 text-[#FAF9F5]'
            }`}>
              {totalCartItems}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Showcase */}
      <section className="px-6 sm:px-12 pt-12 sm:pt-20 pb-10 sm:pb-12 max-w-7xl mx-auto">
        <p className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
          Handcrafted Essentials & Fermentations
        </p>
        <h1 className="text-3xl sm:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[1.1] max-w-4xl">
          Thoughtfully created products built with <span className={`italic font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>precision & care.</span>
        </h1>
      </section>

      {/* Categories, Search, Currency & Sorting */}
      <section id="works" className="px-6 sm:px-12 max-w-7xl mx-auto pb-8 sm:pb-10">
        <div className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b pb-6 ${
          isDarkMode ? 'border-stone-800' : 'border-stone-200/80'
        }`}>
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] sm:text-xs uppercase tracking-widest px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all ${
                  selectedCategory === cat ? pillActive : pillInactive
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search, Currency & Sort Group */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
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

            {/* Currency Selector (Positioned Next to Search) */}
            <div className="relative w-full sm:w-auto">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className={`w-full sm:w-auto px-4 py-2 rounded-full border text-xs font-mono font-medium focus:outline-none cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-600' 
                    : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                }`}
                title="Select store currency"
              >
                <option value="USD">USD ($)</option>
                <option value="LKR">LKR (Rs.)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Price Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`w-full sm:w-auto px-4 py-2 rounded-full border text-xs focus:outline-none ${
                isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-300' : 'bg-white border-stone-300 text-stone-700'
              }`}
            >
              <option value="default">Sort: Featured</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="px-6 sm:px-12 max-w-7xl mx-auto pb-24">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-stone-400 text-sm mb-4">No products found matching "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Works'); }}
              className="text-xs uppercase font-mono tracking-wider underline text-stone-500 hover:text-current"
            >
              Reset Filters
            </button>
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
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-md rounded-xl transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    className={`relative z-10 w-full text-xs uppercase tracking-widest py-3 rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm ${
                      isDarkMode ? 'bg-stone-100/90 text-stone-900' : 'bg-stone-900/90 text-[#FAF9F5]'
                    }`}
                  >
                    Quick Add +
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

      {/* Craftsmanship Section */}
      <section id="about" className={`py-16 sm:py-20 px-6 sm:px-12 border-t ${isDarkMode ? 'border-stone-800 bg-[#171615]' : 'border-stone-200/80 bg-[#F4F2EC]'}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
            Behind The Brand
          </p>
          <h2 className="text-2xl sm:text-5xl font-light tracking-tight mb-10 sm:mb-12 max-w-3xl">
            Artisanal formulation meeting raw physical chemistry.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16">
            <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-[#FAF9F5] border-stone-200'}`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-900/10 text-amber-800 flex items-center justify-center text-xl font-mono mb-6">
                🌴
              </div>
              <h3 className="text-xl font-medium mb-3">Natural King Coconut Fermentation</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Ziel King Coconut Wine is born from small-batch natural fermentations of pure, unrefined king coconut nectar. Through meticulous temperature control and physical chemistry precision, we transform native botanical sugars into a refined golden wine with natural floral warmth and balanced acidity.
              </p>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-[#FAF9F5] border-stone-200'}`}>
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

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 px-6 sm:px-12 max-w-5xl mx-auto">
        <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
          Answers & Information
        </p>
        <h2 className="text-2xl sm:text-4xl font-light tracking-tight mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl overflow-hidden transition-colors ${
                isDarkMode ? 'border-stone-800 bg-stone-900/30' : 'border-stone-200 bg-white'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center text-xs sm:text-sm font-medium"
              >
                <span>{faq.q}</span>
                <span className="text-lg leading-none">{openFaq === idx ? '−' : '+'}</span>
              </button>

              {openFaq === idx && (
                <div className={`px-6 pb-4 text-xs leading-relaxed border-t pt-3 ${
                  isDarkMode ? 'border-stone-800 text-stone-400' : 'border-stone-100 text-stone-600'
                }`}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-16 sm:py-20 px-6 sm:px-12 border-t ${isDarkMode ? 'border-stone-800' : 'border-stone-200'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
              Get In Touch
            </p>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight mb-4">
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

          <div className={`p-6 sm:p-8 rounded-3xl border ${modalBg}`}>
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

      {/* Product Details Modal */}
      {activeProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-opacity overflow-y-auto"
          onClick={handleCloseProduct}
        >
          <div 
            className={`${modalBg} rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative border my-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseProduct}
              className={`absolute top-4 right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                isDarkMode ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              }`}
            >
              ✕
            </button>

            <div className={`w-full md:w-1/2 ${isDarkMode ? activeProduct.colorBgDark : activeProduct.colorBgLight} p-6 sm:p-8 flex items-center justify-center min-h-[220px] md:min-h-[420px]`}>
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="max-h-[240px] sm:max-h-[320px] w-auto object-contain drop-shadow-xl"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
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

                <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
                  {activeProduct.name}
                </h2>
                <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {activeProduct.tagline}
                </p>

                <div className="mt-4 text-xl sm:text-2xl font-mono font-semibold">
                  {formatPrice(activeProduct.price)}
                  <span className={`text-xs font-sans font-normal ml-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>/ item</span>
                </div>

                <p className={`mt-4 text-xs leading-relaxed border-t pt-4 ${
                  isDarkMode ? 'border-stone-800 text-stone-300' : 'border-stone-200/80 text-stone-600'
                }`}>
                  {activeProduct.description}
                </p>

                {activeProduct.specs && activeProduct.specs.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono border-t pt-3 border-stone-200/20">
                    {activeProduct.specs.map((s, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-stone-400 uppercase">{s.label}</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`mt-6 sm:mt-8 border-t pt-4 sm:pt-5 ${isDarkMode ? 'border-stone-800' : 'border-stone-200/80'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs uppercase font-medium tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    Select Quantity
                  </span>

                  <div className={`flex items-center space-x-3 border rounded-full px-3 py-1 shadow-sm ${
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
                  className={`w-full py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    activeProduct.isAvailable
                      ? isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                      : 'bg-stone-500 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  {activeProduct.isAvailable ? `Add To Bag • ${formatPrice(activeProduct.price * modalQuantity)}` : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Bag Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsCartOpen(false)} 
          />
          <div className={`relative z-10 w-full max-w-md h-full shadow-2xl flex flex-col justify-between ${modalBg}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-stone-800' : 'border-stone-200'}`}>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-medium uppercase tracking-wider">Shopping Bag</h3>
                <span className="text-xs font-mono text-stone-400">({totalCartItems})</span>
              </div>
              <div className="flex items-center space-x-3">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] uppercase tracking-wider text-rose-500 hover:text-rose-700 underline"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-stone-400 hover:text-stone-600 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 divide-y divide-stone-200/20">
              {cart.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="text-3xl mb-2">🛍️</div>
                  <p className="text-xs font-mono text-stone-400">Your shopping bag is currently empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-2">
                    <div className="flex-1 pr-2">
                      <h4 className="text-xs font-medium">{item.name}</h4>
                      <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                        {formatPrice(item.price)} each
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[9px] uppercase tracking-wider font-semibold text-rose-500 hover:text-rose-700 mt-1.5 flex items-center gap-1 transition-colors"
                      >
                        <span>🗑</span> Remove Item
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 border rounded-full px-2.5 py-1 text-xs font-mono ${
                        isDarkMode ? 'border-stone-700 bg-stone-800' : 'border-stone-300 bg-white'
                      }`}>
                        <button 
                          onClick={() => updateCartQty(item.id, -1)} 
                          className="hover:text-rose-500 font-bold px-1 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-semibold">{item.qty}</span>
                        <button 
                          onClick={() => updateCartQty(item.id, 1)} 
                          className="hover:opacity-60 font-bold px-1 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-mono font-semibold min-w-[55px] text-right">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className={`p-6 border-t space-y-4 ${isDarkMode ? 'border-stone-800 bg-stone-900/30' : 'border-stone-200 bg-stone-50/50'}`}>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Estimated Shipping</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-stone-200/20 text-current">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                  }`}
                >
                  Proceed To Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Order History Modal */}
      {isOrdersOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsOrdersOpen(false)}
        >
          <div 
            className={`w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-2xl border my-auto ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200/20">
              <div>
                <h3 className="text-base font-medium uppercase tracking-wider">Your Order History</h3>
                <p className="text-xs text-stone-400 font-mono mt-0.5">Orders placed under {user?.email}</p>
              </div>
              <button onClick={() => setIsOrdersOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">✕</button>
            </div>

            {ordersLoading ? (
              <div className="py-12 text-center text-xs font-mono text-stone-400">Loading order records...</div>
            ) : userOrders.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="text-3xl">📦</div>
                <p className="text-xs font-mono text-stone-400">No past orders found on your account.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {userOrders.map((ord) => (
                  <div 
                    key={ord.id} 
                    className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
                      isDarkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-100/60 border-stone-200'
                    }`}
                  >
                    <div className="flex justify-between items-center border-b pb-2 border-stone-200/20">
                      <span className="font-bold text-sm tracking-wider">{ord.order_number}</span>
                      <span className="text-[10px] text-stone-400">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-400">
                      <div><span className="text-stone-500">Destination:</span> {ord.city}</div>
                      <div><span className="text-stone-500">Payment:</span> {ord.payment_method.toUpperCase()}</div>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-stone-200/20 font-semibold text-current">
                      <span>Total Billed</span>
                      <span className="text-sm font-bold">{formatPrice(Number(ord.total_amount))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supabase Auth Modal */}
      {isAuthOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAuthOpen(false)}
        >
          <div 
            className={`w-full max-w-sm p-6 sm:p-8 rounded-3xl shadow-2xl border ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium uppercase tracking-wider">
                {authMode === 'signin' ? 'Account Sign In' : 'Create Account'}
              </h3>
              <button onClick={() => setIsAuthOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
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
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                  isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                } ${authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {authLoading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Register'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-[10px] uppercase tracking-wider text-stone-400 hover:text-stone-600 underline"
              >
                {authMode === 'signin' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div 
            className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl border my-auto ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            {checkoutStep === 'details' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-medium uppercase tracking-wider">Checkout & Shipping</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">✕</button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+94 77 123 4567"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                          isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                        City
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
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Street name, house number..."
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                      Payment Method
                    </label>
                    <select
                      value={shippingForm.paymentMethod}
                      onChange={(e) => setShippingForm({ ...shippingForm, paymentMethod: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="bank">Direct Bank Transfer</option>
                    </select>
                  </div>

                  <div className={`p-4 rounded-xl text-xs font-mono space-y-1.5 my-4 ${
                    isDarkMode ? 'bg-stone-900/60 border border-stone-800' : 'bg-stone-100/80 border border-stone-200'
                  }`}>
                    <div className="flex justify-between text-stone-400">
                      <span>Items ({totalCartItems})</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Shipping</span>
                      <span>{formatPrice(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t border-stone-200/20 text-current">
                      <span>Total Amount</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                      isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                    }`}
                  >
                    Confirm Order ({formatPrice(grandTotal)})
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-medium tracking-tight mb-1">Order Saved & Confirmed!</h3>
                <p className="text-xs text-stone-400 font-mono mb-6">Receipt ID: {receipt?.orderId}</p>

                {receipt && (
                  <div className={`text-left p-4 rounded-2xl border text-xs font-mono space-y-2 mb-6 ${
                    isDarkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-100/60 border-stone-200'
                  }`}>
                    <div className="border-b pb-2 mb-2 font-semibold">
                      Recipient: {receipt.customerName}
                    </div>
                    <div>Address: {receipt.address}, {receipt.city}</div>
                    <div>Phone: {receipt.phone}</div>
                    <div>Payment: {receipt.paymentMethod}</div>
                    <div className="border-t pt-2 mt-2 space-y-1">
                      {receipt.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-stone-400">
                          <span>{it.qty}x {it.name}</span>
                          <span>{formatPrice(it.price * it.qty)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold text-current pt-1 border-t border-stone-200/20">
                        <span>Total Paid</span>
                        <span>{formatPrice(receipt.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutStep('details');
                  }}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-[#FAF9F5] hover:bg-stone-800'
                  }`}
                >
                  Return To Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className={`border-t py-12 px-6 sm:px-12 text-center text-xs font-mono ${
        isDarkMode ? 'border-stone-800 text-stone-500' : 'border-stone-200/80 text-stone-400'
      }`}>
        <p>© {new Date().getFullYear()} Ziel Store. Artisanal Fermentations & Handcrafted Formulations.</p>
      </footer>
    </main>
  );
}