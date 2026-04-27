import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCartStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const restId = searchParams.get('restaurant');
  const table = searchParams.get('table');
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const cart = useCartStore();

  useEffect(() => {
    if (!restId || !table) {
      toast.error('Invalid QR Code');
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        const restDoc = await getDoc(doc(db, 'restaurants', restId));
        if (restDoc.exists()) setRestaurant(restDoc.data());

        const q = query(collection(db, 'menus'), where('restaurantId', '==', restId), where('active', '==', true));
        const snap = await getDocs(q);
        const menuItems = snap.docs.map(d => ({id: d.id, ...d.data()} as any));
        setItems(menuItems);
        
        const cats = Array.from(new Set(menuItems.map(m => m.category)));
        setCategories(['All', ...cats] as string[]);
      } catch (e) {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [restId, table, navigate]);

  const placeOrder = async () => {
    if (cart.items.length === 0) return;
    try {
      const orderId = Date.now().toString();
      await setDoc(doc(db, 'orders', orderId), {
        restaurantId: restId,
        tableNumber: Number(table),
        status: 'pending',
        items: cart.items,
        total: cart.total(),
        createdAt: serverTimestamp()
      });
      cart.clearCart();
      setIsCartOpen(false);
      toast.success('Order placed successfully!');
    } catch(e: any) {
      console.error(e);
      toast.error('Failed to place order: ' + e?.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading menu...</div>;
  if (!restaurant) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Restaurant not found</div>;

  const filteredItems = items.filter(i => {
    const matchesCat = activeCat === 'All' || i.category === activeCat;
    const matchesSearch = i.name?.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-white/10 p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <p className="text-[#D4AF37] text-sm">Table {table}</p>
          <input 
            type="text" 
            placeholder="Search menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mt-3 bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#D4AF37] placeholder:text-gray-500"
          />
        </div>
      </header>

      {/* Categories */}
      <div className="overflow-x-auto p-4 flex gap-2 no-scrollbar">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              activeCat === c ? 'bg-[#D4AF37] text-black w-[unset]' : 'bg-[#111] text-gray-300 w-[unset] border border-[#222]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto p-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden flex flex-col">
            <div className="h-48 bg-[#222] relative flex items-center justify-center overflow-hidden">
               {item.image ? (
                 <img 
                   src={item.image} 
                   alt={item.name} 
                   className="w-full h-full object-cover absolute inset-0"
                   onError={(e) => {
                     e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                   }} 
                 />
               ) : (
                 <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" alt="placeholder" className="w-full h-full object-cover absolute inset-0 opacity-30 grayscale" />
               )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-1 flex items-center justify-between">
                <span>{item.name}</span>
                {item.isVeg !== undefined && (
                  <span className={`inline-block w-4 h-4 rounded-full border ${item.isVeg ? 'border-green-600 bg-green-500/20' : 'border-red-600 bg-red-500/20'} relative ml-2 flex-shrink-0`}>
                    <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                  </span>
                )}
              </h3>
              {item.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>}
              <p className="text-[#D4AF37] font-semibold text-lg mb-4 mt-auto">₹{item.price}</p>
              <Button 
                onClick={() => {
                   cart.addItem(item);
                   toast.success(`${item.name} added to cart`);
                }}
                className="w-full mt-auto"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button (when closed) */}
      <AnimatePresence>
        {cart.items.length > 0 && !isCartOpen && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#D4AF37] text-black shadow-xl shadow-[#D4AF37]/20 rounded-2xl p-4 flex items-center justify-between font-bold"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag />
                <span>{cart.items.reduce((acc, i) => acc + i.qty, 0)} items</span>
              </div>
              <span>₹{cart.total()}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Bottom Sheet */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-[#111] border-t border-[#222] rounded-t-3xl z-50 flex flex-col justify-end max-w-2xl mx-auto overflow-hidden"
            >
              <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#111]">
                <h2 className="text-xl font-bold flex items-center gap-2">Your Order</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => cart.clearCart()} className="text-sm font-medium text-gray-500 hover:text-red-400">Clear</button>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 bg-[#222] rounded-full text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-4 space-y-4 max-h-[50vh]">
                {cart.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                    <ShoppingBag size={48} className="text-[#333] mb-4" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-gray-400">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-[#222] rounded-lg p-1">
                        <button onClick={() => cart.updateQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center font-bold text-[#D4AF37] hover:bg-[#333] rounded-md transition-colors">-</button>
                        <span className="w-4 text-center font-medium">{item.qty}</span>
                        <button onClick={() => cart.updateQty(item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-[#D4AF37] hover:bg-[#333] rounded-md transition-colors">+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-[#0A0A0A] border-t border-[#222]">
                <div className="flex justify-between mb-4 text-lg">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="font-bold text-[#D4AF37]">₹{cart.total()}</span>
                </div>
                <Button className="w-full py-4 text-lg" onClick={placeOrder} disabled={cart.items.length === 0}>
                  Place Order
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
