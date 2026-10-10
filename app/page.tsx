'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { generateInvoicePdf } from '../lib/generatePdf';
import LuxuryStoryHero from '../components/LuxuryStoryHero';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stockQty: number;
  tagline: string;
  description: string;
  isAvailable: boolean;
  image: string;
  aspect: string;
  colorBgLight: string;
  colorBgDark: string;
  specs: { label: string; value: string }[];
}

interface AppliedCoupon {
  code: string;
  discount_type: 'percentage' | 'flat' | 'free_shipping';
  discount_value: number;
}

interface OrderReceipt {
  orderId: string;
  items: { id: number; name: string; price: number; qty: number }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  customerName: string;
  customerEmail?: string;
  address: string;
  city: string;
  phone: string;
  paymentMethod: string;
  receiptUrl?: string | null;
  zoneName: string;
  couponCode?: string | null;
}

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

interface ShippingZone {
  code: string;
  name: string;
  baseUsd: number;
  freeThresholdUsd?: number;
}

const SHIPPING_ZONES: Record<string, ShippingZone> = {
  LK_LOCAL: { code: 'LK_LOCAL', name: 'Sri Lanka (Colombo & Gampaha)', baseUsd: 1.35, freeThresholdUsd: 35 },
  LK_OUT: { code: 'LK_OUT', name: 'Sri Lanka (Islandwide Outstation)', baseUsd: 1.85, freeThresholdUsd: 35 },
  SAARC: { code: 'SAARC', name: 'India, Maldives, UAE & Middle East', baseUsd: 16.0 },
  EU_UK: { code: 'EU_UK', name: 'United Kingdom & Europe', baseUsd: 24.0 },
  US_CA: { code: 'US_CA', name: 'USA, Canada & Australia', baseUsd: 29.0 },
  ROW: { code: 'ROW', name: 'Rest of the World (Tracked Air Export)', baseUsd: 34.0 },
  CUSTOM: { code: 'CUSTOM', name: 'Bulk Order / Custom Freight (Negotiable)', baseUsd: 0 },
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Ziel King Coconut Wine',
    category: 'Wines',
    price: 32.0,
    stockQty: 4,
    tagline: 'Batch No. 04 — Artisanal Fermentation',
    description:
      'Slow-fermented naturally from fresh king coconut nectar. Features rich floral aromatics, subtle caramel warmth, and a smooth, balanced crisp finish. Best served chilled.',
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
    price: 14.0,
    stockQty: 22,
    tagline: 'Mechanics Formula — Grease & Oil Removal',
    description:
      'Specially formulated cold-process soap designed to lift tough industrial grease, engine oil, rust, and dirt without drying out skin. Infused with natural exfoliants and pumice.',
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
    price: 10.0,
    stockQty: 3,
    tagline: 'Natural Oils & Hydrating Lipids',
    description:
      'Handcrafted moisturizing soap made with virgin coconut oil, essential botanical extracts, and rich nourishing lipids for gentle daily skin cleansing.',
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
    price: 48.0,
    stockQty: 2,
    tagline: 'Aged 12 Months — Limited Edition',
    description:
      'A premium limited-edition reserve vintage aged in oak casks for 12 months. Delivers complex notes of toasted coconut, vanilla, and oak undertones.',
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
    price: 12.0,
    stockQty: 18,
    tagline: 'Exfoliating Pumice & Citrus Oil',
    description:
      'Heavy-duty exfoliating bar infused with organic orange peel oils and fine volcanic pumice. Effortlessly dissolves inks, paints, and heavy grime.',
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
    price: 65.0,
    stockQty: 5,
    tagline: 'Artisanal Wine & Cleanser Duo',
    description:
      'Our flagship signature bundle featuring 1 bottle of Batch No. 04 King Coconut Wine alongside 2 bars of handcrafted Ziel soaps in custom gift packaging.',
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
    q: 'What are your delivery timelines within Sri Lanka and internationally?',
    a: 'Domestic orders are delivered within 1–3 business days. International courier shipments are dispatched tracked via air freight and arrive within 5–12 business days depending on customs clearance.',
  },
];

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Works');
  const [sortBy, setSortBy] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');

  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify-otp'>('signin');
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<PastOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('LK_LOCAL');
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Colombo',
    paymentMethod: 'bank',
  });
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const formatPrice = (amountInUsd: number) => {
    const { symbol, rate, decimals } = CURRENCIES[currency];
    const converted = amountInUsd * rate;
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('catalog-start');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  useEffect(() => {
    async function fetchSupabaseProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true);

        if (!error && data && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category || 'Wines',
            price: Number(item.price),
            stockQty: Number(item.stock_qty ?? 10),
            tagline: item.tagline || '',
            description: item.description || '',
            isAvailable: item.is_available,
            image: item.image_url || '/images/wine.jpg',
            aspect: 'aspect-[4/5]',
            colorBgLight: 'bg-[#EFECE6]',
            colorBgDark: 'bg-[#22211F]',
            specs: [{ label: 'Stock', value: `${item.stock_qty || 0} units` }],
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load products from database:', err);
      }
    }

    fetchSupabaseProducts();
  }, []);

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

  useEffect(() => {
    const savedCart = localStorage.getItem('ziel_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    const savedTheme = localStorage.getItem('ziel_theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');

    const savedCurrency = localStorage.getItem('ziel_currency') as Currency;
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrency(savedCurrency);
    } else {
      fetch('/api/geo')
        .then((res) => res.json())
        .then((data) => {
          if (data?.defaultCurrency && CURRENCIES[data.defaultCurrency as Currency]) {
            setCurrency(data.defaultCurrency as Currency);
          }
          if (data?.defaultZone && SHIPPING_ZONES[data.defaultZone]) {
            setSelectedZone(data.defaultZone);
          }
        })
        .catch((err) => console.warn('Geo detection note:', err));
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All Works' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const clearCart = () => setCart([]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setCouponError(data.message || 'Invalid voucher code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        showNotification(`Voucher ${data.coupon.code} applied!`);
        setCouponError(null);
      }
    } catch (err: any) {
      setCouponError('Network error verifying coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!passwordInput) {
          showNotification('Password required');
          setAuthLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
          options: { data: { full_name: emailInput.split('@')[0] } },
        });

        if (error) {
          showNotification(`Registration Error: ${error.message}`);
        } else {
          if (!data.session) {
            setAuthMode('verify-otp');
            showNotification('OTP sent! Please check your email.');
          } else {
            showNotification('Account created successfully!');
            setIsAuthOpen(false);
            setPasswordInput('');
          }
        }
      } else if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput,
        });

        if (error) {
          showNotification(`Sign In Error: ${error.message}`);
        } else {
          showNotification('Welcome back!');
          setIsAuthOpen(false);
          setPasswordInput('');
        }
      }
    } catch (err: any) {
      showNotification(err?.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailInput,
        token: otpInput.trim(),
        type: 'signup',
      });

      if (error) {
        showNotification(`Verification Failed: ${error.message}`);
      } else if (data?.session) {
        showNotification('Email verified! You are now logged in.');
        setIsAuthOpen(false);
        setOtpInput('');
        setPasswordInput('');
        setAuthMode('signin');
      }
    } catch (err: any) {
      showNotification(err?.message || 'Verification failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!emailInput) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: emailInput });
      if (error) {
        showNotification(`Resend Error: ${error.message}`);
      } else {
        showNotification('A new OTP has been sent.');
      }
    } catch (err: any) {
      showNotification(err?.message || 'Could not resend OTP');
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

  const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const currentZone = SHIPPING_ZONES[selectedZone] || SHIPPING_ZONES.LK_LOCAL;

  const rawShippingFee = (() => {
    if (subtotal === 0) return 0;
    if (currentZone.code === 'CUSTOM') return 0;
    if (currentZone.freeThresholdUsd && subtotal >= currentZone.freeThresholdUsd) return 0;
    return currentZone.baseUsd;
  })();

  const discountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return (subtotal * appliedCoupon.discount_value) / 100;
    }
    if (appliedCoupon.discount_type === 'flat') {
      return Math.min(subtotal, appliedCoupon.discount_value);
    }
    return 0;
  })();

  const shippingFee = appliedCoupon?.discount_type === 'free_shipping' ? 0 : rawShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showNotification('Your bag is empty.');
      return;
    }

    if (shippingForm.paymentMethod === 'bank' && !slipFile) {
      showNotification('Please upload your bank deposit slip.');
      return;
    }

    setSubmittingOrder(true);
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNum = `ZIEL-${randomNum}`;
    let uploadedSlipUrl: string | null = null;

    try {
      if (shippingForm.paymentMethod === 'bank' && slipFile) {
        const fileExt = slipFile.name.split('.').pop()?.toLowerCase() || 'png';
        const cleanFileName = `slip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(cleanFileName, slipFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Storage Upload Error:', uploadError);
          showNotification(`Receipt notice: ${uploadError.message}`);
        } else if (uploadData) {
          const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(cleanFileName);
          uploadedSlipUrl = urlData?.publicUrl || null;
        }
      }

      const initialStatus = currentZone.code === 'CUSTOM' ? 'Freight Quote Pending' : 'Pending';

      const orderPayload = {
        order_number: orderNum,
        user_id: user?.id || null,
        total_amount: grandTotal,
        shipping_fee: shippingFee,
        payment_method: shippingForm.paymentMethod,
        shipping_address: `${shippingForm.address} [${currentZone.name}]`,
        city: shippingForm.city,
        phone: shippingForm.phone,
        receipt_url: uploadedSlipUrl,
        status: initialStatus,
        coupon_code: appliedCoupon?.code || null,
      };

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id, order_number, total_amount')
        .single();

      if (orderError) {
        alert(`Order placement error: ${orderError.message}`);
        setSubmittingOrder(false);
        return;
      }

      if (orderData?.id) {
        try {
          const orderItemsPayload = cart.map((item) => ({
            order_id: orderData.id,
            product_id: item.id,
            quantity: item.qty,
            unit_price: item.price,
          }));
          await supabase.from('order_items').insert(orderItemsPayload);
        } catch (itemErr) {
          console.warn('Order items note:', itemErr);
        }
      }

      const paymentMethodLabel =
        shippingForm.paymentMethod === 'cod'
          ? 'Cash on Delivery'
          : shippingForm.paymentMethod === 'card'
          ? 'Credit/Debit Card'
          : 'Direct Bank Transfer';

      const newReceipt: OrderReceipt = {
        orderId: orderNum,
        items: [...cart],
        subtotal,
        discountAmount,
        shippingFee,
        total: grandTotal,
        customerName: shippingForm.fullName || user?.name || 'Valued Customer',
        customerEmail: shippingForm.email || user?.email || undefined,
        address: shippingForm.address,
        city: shippingForm.city,
        phone: shippingForm.phone,
        receiptUrl: uploadedSlipUrl,
        zoneName: currentZone.name,
        paymentMethod: paymentMethodLabel,
        couponCode: appliedCoupon?.code || null,
      };

      const lineItemsForNotification = cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price }));

      try {
        fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: orderNum,
            customerName: shippingForm.fullName || user?.name || 'Valued Customer',
            customerEmail: shippingForm.email || user?.email || undefined,
            phone: shippingForm.phone,
            address: shippingForm.address,
            city: shippingForm.city,
            shippingZone: currentZone.name,
            paymentMethod: paymentMethodLabel,
            items: lineItemsForNotification,
            subtotal,
            discountAmount,
            shippingFee,
            totalAmount: grandTotal,
            receiptUrl: uploadedSlipUrl,
            couponCode: appliedCoupon?.code || null,
          }),
        }).catch((err) => console.warn('Email dispatch warning:', err));
      } catch (mailErr) {
        console.warn('Email trigger bypass:', mailErr);
      }

      try {
        fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: orderNum,
            customerName: shippingForm.fullName || user?.name || 'Valued Customer',
            customerEmail: shippingForm.email || user?.email || undefined,
            phone: shippingForm.phone,
            city: shippingForm.city,
            shippingZone: currentZone.name,
            paymentMethod: paymentMethodLabel,
            totalAmount: grandTotal,
            items: lineItemsForNotification,
            receiptUrl: uploadedSlipUrl,
          }),
        }).catch((err) => console.warn('Push alert warning:', err));
      } catch (pushErr) {
        console.warn('Push trigger bypass:', pushErr);
      }

      setReceipt(newReceipt);
      setCart([]);
      setSlipFile(null);
      setAppliedCoupon(null);
      setCouponInput('');
      setCheckoutStep('success');
    } catch (err: any) {
      alert(`Unexpected error: ${err?.message || 'Check network connection'}`);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Dynamic Theme Colors
  const bgMain = isDarkMode ? 'bg-[#141413] text-[#F0EFEA]' : 'bg-[#FAF9F5] text-[#1C1B1A]';
  const headerBg = isDarkMode ? 'bg-[#141413]/85 border-stone-800' : 'bg-[#FAF9F5]/90 border-[#E8E4DC]';
  const subBannerBg = isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-[#F2EFE9] border-[#E8E4DC] text-[#78716A]';
  const cardBorder = isDarkMode ? 'border-stone-800 hover:border-stone-700' : 'border-[#E8E4DC] hover:border-[#D9D4C7]';
  const modalBg = isDarkMode ? 'bg-[#1A1918] border-stone-800 text-[#F0EFEA]' : 'bg-[#FAF9F5] border-[#E8E4DC] text-[#1C1B1A]';
  const pillActive = isDarkMode ? 'bg-[#F0EFEA] text-[#141413]' : 'bg-[#1C1B1A] text-[#FAF9F5]';
  const pillInactive = isDarkMode ? 'bg-stone-800/60 text-stone-300 hover:bg-stone-800' : 'bg-[#EFECE6] text-[#78716A] hover:bg-[#E5E1D8]';
  const sectionAltBg = isDarkMode ? 'bg-[#171615] border-stone-800' : 'bg-[#F4F1EA] border-[#E8E4DC]';
  const cardBoxBg = isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-[#FAF9F5] border-[#E8E4DC]';

  return (
    <main className={`min-h-screen ${bgMain} font-sans antialiased transition-colors duration-300 selection:bg-stone-300 selection:text-stone-900 scroll-smooth`}>
      {/* 3D Scrollytelling Hero */}
      <LuxuryStoryHero onExplore={scrollToCatalog} />

      <div id="catalog-start" />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1B1A] text-[#FAF9F5] dark:bg-stone-100 dark:text-stone-900 px-4 py-3 rounded-2xl shadow-xl text-xs font-medium tracking-wide flex items-center space-x-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className={`py-2 px-4 text-center text-[10px] uppercase font-mono tracking-widest border-b ${subBannerBg}`}>
        Batch No. 04 Now Available • Worldwide Air Export & Islandwide Delivery
      </div>

      {/* Store Header */}
      <header className={`sticky top-0 z-30 ${headerBg} backdrop-blur-md border-b px-4 sm:px-12 py-3.5 flex items-center justify-between gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors duration-300`}>
        <div className="flex items-center space-x-2 shrink-0">
          <img
            src="/logo.png"
            alt="Ziel Store Logo"
            className="h-6 sm:h-8 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="text-sm sm:text-lg font-bold tracking-[0.05em] uppercase whitespace-nowrap">
            ZIEL<span className={`font-light ml-1 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>STORE</span>
          </span>
        </div>

        <nav className={`hidden md:flex items-center space-x-10 text-xs font-medium uppercase tracking-widest ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
          <a href="#works" className="hover:text-current transition-colors">Catalog</a>
          <a href="#about" className="hover:text-current transition-colors">Craftsmanship</a>
          <Link href="/verify" className="hover:text-[#C4883A] transition-colors">Verify Batch</Link>
          <a href="#faq" className="hover:text-current transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-current transition-colors">Contact</a>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Day & Night Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Light / Dark Mode"
            className={`p-1.5 sm:p-2 rounded-full border transition-all flex items-center justify-center shrink-0 ${
              isDarkMode
                ? 'bg-stone-800 border-stone-700 text-amber-300 hover:bg-stone-700'
                : 'bg-[#EFECE6] border-[#D9D4C7] text-stone-700 hover:bg-[#E5E1D8]'
            }`}
          >
            <span className="text-xs sm:text-sm leading-none">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-1">
              <button
                onClick={fetchUserOrders}
                className={`text-[10px] sm:text-xs font-mono px-3 py-1.5 rounded-full border max-w-[90px] sm:max-w-none truncate hover:opacity-80 transition-opacity ${
                  isDarkMode
                    ? 'border-stone-700 bg-stone-800 text-stone-200'
                    : 'border-[#D9D4C7] bg-[#F4F1EA] text-[#1C1B1A]'
                }`}
                title="View your orders"
              >
                👤 {user.name}
              </button>
              <button
                onClick={handleLogout}
                className="text-[9px] uppercase font-mono text-[#8C827A] hover:text-current underline px-1"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsAuthOpen(true); setAuthMode('signin'); }}
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all ${
                isDarkMode
                  ? 'border-stone-700 hover:border-stone-500 text-stone-200 bg-stone-900'
                  : 'border-[#D9D4C7] hover:border-[#1C1B1A] text-[#1C1B1A] bg-[#FFFFFF]'
              }`}
            >
              Account
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className={`group flex items-center space-x-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shadow-sm ${
              isDarkMode
                ? 'bg-[#F0EFEA] text-[#141413] hover:bg-white'
                : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
            }`}
          >
            <span>Bag</span>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-mono transition-colors ${
              isDarkMode ? 'bg-stone-300 text-stone-900' : 'bg-[#FAF9F5] text-[#1C1B1A]'
            }`}>
              {totalCartItems}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Headline */}
      <section className="px-6 sm:px-12 pt-12 sm:pt-20 pb-10 sm:pb-12 max-w-7xl mx-auto">
        <p className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>
          Artisanal Fermentations & Handcrafted Formulations
        </p>
        <h2 className="text-3xl sm:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[1.1] max-w-4xl">
          Thoughtfully created products built with <span className={`italic font-normal ${isDarkMode ? 'text-amber-400' : 'text-[#C4883A]'}`}>precision & care.</span>
        </h2>
      </section>

      {/* Catalog Filters */}
      <section id="works" className="px-6 sm:px-12 max-w-7xl mx-auto pb-8 sm:pb-10">
        <div className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b pb-6 ${isDarkMode ? 'border-stone-800' : 'border-[#E8E4DC]'}`}>
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

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 text-xs rounded-full border focus:outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-stone-500'
                    : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] placeholder-[#A8A29E] focus:border-[#1C1B1A]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-current"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className={`w-full sm:w-auto px-4 py-2 rounded-full border text-xs font-mono font-medium focus:outline-none cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-600'
                    : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] hover:border-[#1C1B1A]'
                }`}
                title="Select store currency"
              >
                <option value="USD">USD ($)</option>
                <option value="LKR">LKR (Rs.)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`w-full sm:w-auto px-4 py-2 rounded-full border text-xs focus:outline-none ${
                isDarkMode
                  ? 'bg-stone-900 border-stone-700 text-stone-300'
                  : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A]'
              }`}
            >
              <option value="default">Sort: Featured</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product Grid with Automated Low-Stock Badges */}
      <section className="px-6 sm:px-12 max-w-7xl mx-auto pb-24">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#8C827A] text-sm mb-4">No products found matching "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Works'); }}
              className="text-xs uppercase font-mono tracking-wider underline text-[#78716A] hover:text-current"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {filteredProducts.map((product) => {
              const isLowStock = product.isAvailable && product.stockQty > 0 && product.stockQty <= 5;
              const isSoldOut = !product.isAvailable || product.stockQty === 0;

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenProduct(product)}
                  className="group flex flex-col justify-between cursor-pointer"
                >
                  <div className={`relative w-full ${product.aspect} ${isDarkMode ? product.colorBgDark : 'bg-[#F4F1EA]'} rounded-3xl overflow-hidden border ${cardBorder} p-5 flex flex-col justify-between transition-all duration-500 group-hover:shadow-xl`}>
                    
                    {/* Top Row: Category + Scarcity / Price Badges */}
                    <div className="flex justify-between items-start z-10 w-full gap-2">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm border ${
                          isDarkMode
                            ? 'bg-stone-900/80 text-stone-400 border-stone-800'
                            : 'bg-[#FFFFFF]/90 text-[#78716A] border-[#E8E4DC]'
                        }`}>
                          {product.category}
                        </span>

                        {/* Automated Low Stock Badge */}
                        {isLowStock && (
                          <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                            Only {product.stockQty} left in batch
                          </span>
                        )}

                        {isSoldOut && (
                          <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 backdrop-blur-md">
                            Batch Sold Out
                          </span>
                        )}
                      </div>

                      <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md backdrop-blur-sm border shrink-0 ${
                        isDarkMode
                          ? 'bg-stone-900/80 text-stone-300 border-stone-800'
                          : 'bg-[#FFFFFF]/90 text-[#1C1B1A] border-[#E8E4DC]'
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
                        if (!isSoldOut) addToCart(product, 1);
                      }}
                      disabled={isSoldOut}
                      className={`relative z-10 w-full text-xs uppercase tracking-widest py-3 rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm ${
                        isSoldOut
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed dark:bg-stone-800 dark:text-stone-600'
                          : isDarkMode
                          ? 'bg-stone-100/90 text-stone-900 hover:bg-white'
                          : 'bg-[#1C1B1A]/95 text-[#FAF9F5] hover:bg-[#C4883A]'
                      }`}
                    >
                      {isSoldOut ? 'Sold Out' : 'Quick Add +'}
                    </button>
                  </div>

                  <div className="mt-4 px-1 flex justify-between items-baseline">
                    <div>
                      <h3 className="text-base font-medium transition-colors">
                        {product.name}
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
                        {product.tagline}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Craftsmanship Section */}
      <section id="about" className={`py-16 sm:py-20 px-6 sm:px-12 border-t ${sectionAltBg}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>
            Behind The Brand
          </p>
          <h2 className="text-2xl sm:text-5xl font-light tracking-tight mb-10 sm:mb-12 max-w-3xl">
            Artisanal formulation meeting raw physical chemistry.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBoxBg}`}>
              <div className="w-12 h-12 rounded-2xl bg-[#C4883A]/15 text-[#C4883A] flex items-center justify-center text-xl font-mono mb-6">
                🌴
              </div>
              <h3 className="text-xl font-medium mb-3">Natural King Coconut Fermentation</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
                Ziel King Coconut Wine is born from small-batch natural fermentations of pure, unrefined king coconut nectar. Through meticulous temperature control and physical chemistry precision, we transform native botanical sugars into a refined golden wine with natural floral warmth and balanced acidity.
              </p>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBoxBg}`}>
              <div className="w-12 h-12 rounded-2xl bg-[#1C1B1A]/10 text-current flex items-center justify-center text-xl font-mono mb-6">
                🧼
              </div>
              <h3 className="text-xl font-medium mb-3">Ziel Grit Mechanics Formula</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
                Engineered for hands that build, repair, and create. Ziel Grit combines cold-process saponified lipid bars with fine volcanic pumice and citrus oils. Designed specifically to dissolve stubborn industrial grease, heavy motor oil, rust particles, and printer ink without harsh synthetic detergents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 px-6 sm:px-12 max-w-5xl mx-auto">
        <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>
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
                isDarkMode
                  ? 'border-stone-800 bg-stone-900/30'
                  : 'border-[#E8E4DC] bg-[#FFFFFF]'
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
                  isDarkMode ? 'border-stone-800 text-stone-400' : 'border-[#F2EFE9] text-[#78716A]'
                }`}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Direct Inquiries & Contact Section */}
      <section id="contact" className={`py-16 sm:py-20 px-6 sm:px-12 border-t ${isDarkMode ? 'border-stone-800' : 'border-[#E8E4DC]'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>
              Get In Touch
            </p>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight mb-4">
              Direct Inquiries & Custom Batch Orders
            </h2>
            <p className={`text-xs leading-relaxed max-w-md ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
              Have questions regarding bulk artisanal wine reservations, wholesale bar stock, or private branding requests? Send us a direct note.
            </p>

            <div className="mt-8 space-y-3 text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className={isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}>Location:</span>
                <span>Colombo & Katunayake, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}>Email:</span>
                <span>inquiries@zielstore.com</span>
              </div>
            </div>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${modalBg}`}>
            {contactSubmitted ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                  ✓
                </div>
                <h4 className="text-lg font-medium">Message Received</h4>
                <p className="text-xs text-[#78716A] mt-1">Thank you. The Ziel team will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className={`block text-[10px] uppercase tracking-widest font-semibold mb-1 ${isDarkMode ? 'text-stone-400' : 'text-[#8C827A]'}`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode
                        ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                        : 'bg-[#FAF9F5] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase tracking-widest font-semibold mb-1 ${isDarkMode ? 'text-stone-400' : 'text-[#8C827A]'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode
                        ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                        : 'bg-[#FAF9F5] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase tracking-widest font-semibold mb-1 ${isDarkMode ? 'text-stone-400' : 'text-[#8C827A]'}`}>
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode
                        ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                        : 'bg-[#FAF9F5] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-stone-100 text-stone-900 hover:bg-white'
                      : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                  }`}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={handleCloseProduct}
        >
          <div 
            className={`border rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative my-auto ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseProduct}
              className={`absolute top-4 right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                isDarkMode
                  ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  : 'bg-[#EFECE6] text-[#1C1B1A] hover:bg-[#E5E1D8]'
              }`}
            >
              ✕
            </button>

            <div className={`w-full md:w-1/2 p-6 sm:p-8 flex items-center justify-center min-h-[220px] md:min-h-[420px] ${
              isDarkMode ? activeProduct.colorBgDark : 'bg-[#F4F1EA]'
            }`}>
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="max-h-[240px] sm:max-h-[320px] w-auto object-contain drop-shadow-xl"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-md ${
                    isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-[#EAE5DB] text-[#524B45]'
                  }`}>
                    {activeProduct.category}
                  </span>

                  <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-md ${
                    activeProduct.isAvailable && activeProduct.stockQty > 0
                      ? isDarkMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'
                      : isDarkMode ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {activeProduct.isAvailable && activeProduct.stockQty > 0 ? 'In Stock' : 'Sold Out'}
                  </span>

                  {/* Scarcity Notice inside Modal */}
                  {activeProduct.isAvailable && activeProduct.stockQty > 0 && activeProduct.stockQty <= 5 && (
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/40">
                      Only {activeProduct.stockQty} Remaining
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
                  {activeProduct.name}
                </h2>
                <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
                  {activeProduct.tagline}
                </p>

                <div className="mt-4 text-xl sm:text-2xl font-mono font-semibold">
                  {formatPrice(activeProduct.price)}
                  <span className={`text-xs font-sans font-normal ml-2 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>/ item</span>
                </div>

                <p className={`mt-4 text-xs leading-relaxed border-t pt-4 ${
                  isDarkMode ? 'border-stone-800 text-stone-300' : 'border-[#E8E4DC] text-[#524B45]'
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

              <div className={`mt-6 sm:mt-8 border-t pt-4 sm:pt-5 ${isDarkMode ? 'border-stone-800' : 'border-[#E8E4DC]'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs uppercase font-medium tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
                    Select Quantity
                  </span>

                  <div className={`flex items-center space-x-3 border rounded-full px-3 py-1 shadow-sm ${
                    isDarkMode ? 'border-stone-700 bg-stone-800' : 'border-[#D9D4C7] bg-[#FFFFFF]'
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
                      onClick={() => setModalQuantity((q) => Math.min(activeProduct.stockQty || 99, q + 1))}
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
                  disabled={!activeProduct.isAvailable || activeProduct.stockQty === 0}
                  className={`w-full py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    activeProduct.isAvailable && activeProduct.stockQty > 0
                      ? isDarkMode ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                      : 'bg-[#D9D4C7] text-[#8C827A] cursor-not-allowed'
                  }`}
                >
                  {activeProduct.isAvailable && activeProduct.stockQty > 0
                    ? `Add To Bag • ${formatPrice(activeProduct.price * modalQuantity)}`
                    : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in Shopping Bag */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="fixed inset-0" onClick={() => setIsCartOpen(false)} />
          <div className={`relative z-10 w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l ${modalBg}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-stone-800' : 'border-[#E8E4DC]'}`}>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-medium uppercase tracking-wider">Shopping Bag</h3>
                <span className="text-xs font-mono text-[#8C827A]">({totalCartItems})</span>
              </div>
              <div className="flex items-center space-x-3">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] uppercase tracking-wider text-rose-600 hover:text-rose-800 underline"
                  >
                    Clear All
                  </button>
                )}
                <button onClick={() => setIsCartOpen(false)} className="text-[#8C827A] hover:text-current text-lg">✕</button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 divide-y divide-stone-200/20">
              {cart.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="text-3xl mb-2">🛍</div>
                  <p className="text-xs font-mono text-[#8C827A]">Your shopping bag is currently empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-2">
                    <div className="flex-1 pr-2">
                      <h4 className="text-xs font-medium">{item.name}</h4>
                      <p className="text-[10px] font-mono text-[#8C827A] mt-0.5">{formatPrice(item.price)} each</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[9px] uppercase tracking-wider font-semibold text-rose-600 hover:text-rose-800 mt-1.5 flex items-center gap-1 transition-colors"
                      >
                        <span>🗑</span> Remove Item
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 border rounded-full px-2.5 py-1 text-xs font-mono ${
                        isDarkMode ? 'border-stone-700 bg-stone-800' : 'border-[#D9D4C7] bg-[#FFFFFF]'
                      }`}>
                        <button onClick={() => updateCartQty(item.id, -1)} className="hover:text-rose-600 font-bold px-1 transition-colors">-</button>
                        <span className="w-4 text-center font-semibold">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, 1)} className="hover:opacity-60 font-bold px-1 transition-colors">+</button>
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
              <div className={`p-6 border-t space-y-4 ${
                isDarkMode ? 'border-stone-800 bg-stone-900/30' : 'border-[#E8E4DC] bg-[#F4F1EA]'
              }`}>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#78716A]">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#78716A]">
                    <span>Base Shipping Estimate</span>
                    <span>{formatPrice(rawShippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-stone-200/20 text-current">
                    <span>Estimated Total</span>
                    <span>{formatPrice(subtotal + rawShippingFee)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-stone-100 text-stone-900 hover:bg-white'
                      : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                  }`}
                >
                  Proceed To Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders History Modal */}
      {isOrdersOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsOrdersOpen(false)}
        >
          <div 
            className={`w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-2xl border my-auto ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDarkMode ? 'border-stone-800' : 'border-[#E8E4DC]'}`}>
              <div>
                <h3 className="text-base font-medium uppercase tracking-wider">Your Order History</h3>
                <p className="text-xs text-[#8C827A] font-mono mt-0.5">Orders placed under {user?.email}</p>
              </div>
              <button onClick={() => setIsOrdersOpen(false)} className="text-[#8C827A] hover:text-current text-sm">✕</button>
            </div>

            {ordersLoading ? (
              <div className="py-12 text-center text-xs font-mono text-[#8C827A]">Loading order records...</div>
            ) : userOrders.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="text-3xl">📦</div>
                <p className="text-xs font-mono text-[#8C827A]">No past orders found on your account.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {userOrders.map((ord) => (
                  <div 
                    key={ord.id} 
                    className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
                      isDarkMode ? 'border-stone-800 bg-stone-900/60' : 'border-[#E8E4DC] bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex justify-between items-center border-b pb-2 border-stone-200/20">
                      <span className="font-bold text-sm tracking-wider">{ord.order_number}</span>
                      <span className="text-[10px] text-[#8C827A]">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#78716A]">
                      <div><span className="text-[#8C827A]">Destination:</span> {ord.city}</div>
                      <div><span className="text-[#8C827A]">Payment:</span> {ord.payment_method.toUpperCase()}</div>
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

      {/* Authentication Modal */}
      {isAuthOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAuthOpen(false)}
        >
          <div 
            className={`w-full max-w-sm p-6 sm:p-8 rounded-3xl shadow-2xl border ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium uppercase tracking-wider">
                {authMode === 'signin' && 'Account Sign In'}
                {authMode === 'signup' && 'Create Account'}
                {authMode === 'verify-otp' && 'Verify OTP Code'}
              </h3>
              <button onClick={() => setIsAuthOpen(false)} className="text-[#8C827A] hover:text-current text-sm">✕</button>
            </div>

            {authMode === 'verify-otp' ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-[#78716A] leading-relaxed">
                  Enter the 6-digit confirmation code dispatched to <span className="font-semibold text-current">{emailInput}</span>.
                </p>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                    6-Digit Security Token
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-center text-lg tracking-[0.3em] font-mono focus:outline-none ${
                      isDarkMode
                        ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                        : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading || otpInput.length < 6}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-stone-100 text-stone-900 hover:bg-white'
                      : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                  } ${authLoading || otpInput.length < 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {authLoading ? 'Verifying...' : 'Confirm OTP & Sign In'}
                </button>

                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider pt-2 border-t border-stone-200/20">
                  <button type="button" onClick={handleResendOtp} disabled={authLoading} className="text-[#78716A] hover:text-current underline">
                    Resend Code
                  </button>
                  <button type="button" onClick={() => setAuthMode('signup')} className="text-[#78716A] hover:text-current underline">
                    Change Email
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold">
                      Email Address
                    </label>
                    {isEmailValid && (
                      <span className="text-[10px] font-mono text-emerald-600 font-medium flex items-center space-x-1">
                        <span>✓</span>
                        <span>Valid format</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode
                        ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                        : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode
                        ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                        : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-stone-100 text-stone-900 hover:bg-white'
                      : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                  } ${authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {authLoading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Send Verification OTP'}
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                    className="text-[10px] uppercase tracking-wider text-[#78716A] hover:text-current underline"
                  >
                    {authMode === 'signin' ? "Don't have an account? Register with OTP" : 'Already have an account? Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
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
                  <button onClick={() => setIsCheckoutOpen(false)} className="text-[#8C827A] hover:text-current text-sm">✕</button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode
                          ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                          : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                      Email Address (For Invoice & Tracking) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode
                          ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                          : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                      Shipping Destination / Zone *
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode
                          ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                          : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                      }`}
                    >
                      <optgroup label="Sri Lanka Domestic Rates">
                        <option value="LK_LOCAL">Sri Lanka — Colombo & Gampaha (Rs. 400 / ~1–2 Days)</option>
                        <option value="LK_OUT">Sri Lanka — Islandwide Outstation (Rs. 550 / ~2–3 Days)</option>
                      </optgroup>
                      <optgroup label="International Tracked Air Courier">
                        <option value="SAARC">India, Maldives, UAE & Middle East ($16.00 / ~5–7 Days)</option>
                        <option value="EU_UK">United Kingdom & Europe ($24.00 / ~7–10 Days)</option>
                        <option value="US_CA">USA, Canada & Australia ($29.00 / ~7–12 Days)</option>
                        <option value="ROW">Rest of the World ($34.00 / ~10–14 Days)</option>
                        <option value="CUSTOM">Bulk Commercial Export (Negotiable Freight Quote)</option>
                      </optgroup>
                    </select>

                    {selectedZone === 'CUSTOM' ? (
                      <p className="text-[10px] font-mono text-[#C4883A] mt-1.5">
                        ℹ️ Custom freight weight quote will be finalized upon packaging. Initial checkout excludes shipping.
                      </p>
                    ) : (
                      <p className="text-[10px] font-mono text-[#78716A] mt-1">
                        {shippingFee === 0 && subtotal > 0
                          ? '🎉 Complimentary Free Delivery applied!'
                          : `Calculated logistics fee: ${formatPrice(shippingFee)}`}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+94 77 123 4567"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                          isDarkMode
                            ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                            : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                        City & Country *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Colombo, London, Sydney"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                          isDarkMode
                            ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                            : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                      Street Address & Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Street name, suite, house number, ZIP..."
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode
                          ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                          : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                      Promotional Voucher / Coupon
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ZIEL10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono tracking-wider uppercase focus:outline-none ${
                          isDarkMode
                            ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                            : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                        }`}
                      />
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-3 py-2 rounded-xl text-xs font-mono text-rose-600 border border-rose-300 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className={`px-4 py-2 rounded-xl text-xs uppercase font-mono font-bold tracking-wider transition-colors disabled:opacity-50 ${
                            isDarkMode
                              ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                              : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                          }`}
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {couponError && <p className="text-[10px] text-rose-600 font-mono mt-1">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-[10px] text-emerald-600 font-mono mt-1">
                        ✓ Voucher {appliedCoupon.code} applied ({appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% off` : appliedCoupon.discount_type === 'free_shipping' ? 'Free Shipping' : `$${appliedCoupon.discount_value} off`})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8C827A] font-semibold mb-1">
                      Payment Method
                    </label>
                    <select
                      value={shippingForm.paymentMethod}
                      onChange={(e) => setShippingForm({ ...shippingForm, paymentMethod: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDarkMode
                          ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-stone-500'
                          : 'bg-[#FFFFFF] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]'
                      }`}
                    >
                      <option value="bank">Direct Bank Transfer</option>
                      <option value="cod">Cash on Delivery (COD - Domestic only)</option>
                      <option value="card">Credit / Debit Card</option>
                    </select>
                  </div>

                  {/* Hatton National Bank Transfer Details */}
                  {shippingForm.paymentMethod === 'bank' && (
                    <div className={`p-4 rounded-2xl border text-xs font-mono space-y-3 ${
                      isDarkMode
                        ? 'bg-amber-950/20 border-amber-800/40 text-stone-300'
                        : 'bg-[#F4F1EA] border-[#E7E2D8] text-[#1C1B1A]'
                    }`}>
                      <div className="font-bold text-[#C4883A] uppercase tracking-wider text-[11px]">
                        Bank Account Information
                      </div>
                      <div className="space-y-1 text-[11px] text-[#78716A]">
                        <div><strong className="text-current">Bank:</strong> Hatton National Bank (HNB)</div>
                        <div><strong className="text-current">Branch:</strong> Katunayake</div>
                        <div><strong className="text-current">Account Name:</strong> M.A.T.M Meththasinghe</div>
                        <div><strong className="text-current">Account Number:</strong> 049020323384</div>
                      </div>
                      <div className="pt-2 border-t border-stone-200/20">
                        <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-current">
                          Upload Deposit Slip / Screenshot *
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSlipFile(e.target.files[0]);
                            }
                          }}
                          className={`w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-mono file:cursor-pointer ${
                            isDarkMode
                              ? 'file:bg-amber-500 file:text-stone-950'
                              : 'file:bg-[#1C1B1A] file:text-[#FAF9F5]'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className={`p-4 rounded-xl text-xs font-mono space-y-1.5 my-4 border ${
                    isDarkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-[#FFFFFF] border-[#E8E4DC]'
                  }`}>
                    <div className="flex justify-between text-[#78716A]">
                      <span>Items ({totalCartItems})</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Voucher Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#78716A]">
                      <span>Shipping ({currentZone.name.split('(')[0].trim()})</span>
                      <span>{selectedZone === 'CUSTOM' ? 'Quote Pending' : formatPrice(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t border-stone-200/20 text-current">
                      <span>Total Amount</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                      isDarkMode
                        ? 'bg-stone-100 text-stone-900 hover:bg-white'
                        : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                    } ${submittingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {submittingOrder ? 'Processing & Uploading...' : `Confirm Order (${formatPrice(grandTotal)})`}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-medium tracking-tight mb-1">Order Saved & Confirmed!</h3>
                <p className="text-xs text-[#8C827A] font-mono mb-6">Receipt ID: {receipt?.orderId}</p>

                {receipt && (
                  <div className={`text-left p-4 rounded-2xl border text-xs font-mono space-y-2 mb-6 ${
                    isDarkMode ? 'border-stone-800 bg-stone-900/60' : 'border-[#E8E4DC] bg-[#FFFFFF]'
                  }`}>
                    <div className="border-b pb-2 mb-2 font-semibold border-stone-200/20">
                      Recipient: {receipt.customerName}
                    </div>
                    {receipt.customerEmail && <div>Email: {receipt.customerEmail}</div>}
                    <div>Destination: {receipt.zoneName}</div>
                    <div>Address: {receipt.address}, {receipt.city}</div>
                    <div>Phone: {receipt.phone}</div>
                    <div>Payment: {receipt.paymentMethod}</div>
                    {receipt.couponCode && (
                      <div className="text-emerald-600">Coupon Used: {receipt.couponCode}</div>
                    )}
                    {receipt.receiptUrl && (
                      <div className="text-emerald-600">Deposit Slip: Attached ✓</div>
                    )}
                    <div className="border-t pt-2 mt-2 space-y-1 border-stone-200/20">
                      {receipt.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-[#78716A]">
                          <span>{it.qty}x {it.name}</span>
                          <span>{formatPrice(it.price * it.qty)}</span>
                        </div>
                      ))}
                      {receipt.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount Applied</span>
                          <span>-{formatPrice(receipt.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#78716A]">
                        <span>Shipping</span>
                        <span>{formatPrice(receipt.shippingFee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-current pt-1 border-t border-stone-200/20">
                        <span>Total Paid</span>
                        <span>{formatPrice(receipt.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (receipt) {
                      generateInvoicePdf({
                        orderId: receipt.orderId,
                        customerName: receipt.customerName,
                        customerEmail: receipt.customerEmail,
                        phone: receipt.phone,
                        address: receipt.address,
                        city: receipt.city,
                        zoneName: receipt.zoneName,
                        paymentMethod: receipt.paymentMethod,
                        items: receipt.items,
                        subtotal: receipt.subtotal,
                        discountAmount: receipt.discountAmount,
                        couponCode: receipt.couponCode,
                        shippingFee: receipt.shippingFee,
                        total: receipt.total,
                      });
                    }
                  }}
                  className="w-full mb-3 py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold border border-[#C4883A]/40 text-[#C4883A] bg-[#C4883A]/10 hover:bg-[#C4883A]/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>Download Official PDF Receipt</span>
                </button>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutStep('details');
                  }}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-stone-100 text-stone-900 hover:bg-white'
                      : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
                  }`}
                >
                  Return To Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t py-12 px-6 sm:px-12 text-center text-xs font-mono ${
        isDarkMode ? 'border-stone-800 text-stone-500' : 'border-[#E8E4DC] text-[#8C827A]'
      }`}>
        <p>© {new Date().getFullYear()} Ziel Store. Artisanal Fermentations & Handcrafted Formulations.</p>
      </footer>
    </main>
  );
}