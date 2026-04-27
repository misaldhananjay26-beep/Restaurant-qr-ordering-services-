/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('free');

  useEffect(() => {
    const fetchPlan = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, 'subscriptions', auth.currentUser.uid));
      if (snap.exists()) {
        setPlan(snap.data().plan);
      }
    };
    fetchPlan();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Create Razorpay Order
      const res = await fetch('/api/create-order', { method: 'POST' });
      const order = await res.json();

      if (order.error) {
        toast.error(order.error);
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SiLmZCsjNCrFAG', // Using provided test key as fallback
        amount: order.amount,
        currency: "INR",
        name: "Arjuna Table",
        description: "Pro Plan Demo Subscription",
        order_id: order.id,
        handler: async function (response: any) {
          // On Success
          if (auth.currentUser) {
            await updateDoc(doc(db, 'subscriptions', auth.currentUser.uid), {
              plan: 'pro'
            });
            setPlan('pro');
            toast.success("Successfully upgraded to Pro Plan! (Demo)");
          }
        },
        prefill: {
          name: "Test Restaurant",
          email: "test@example.com",
        },
        theme: {
          color: "#D4AF37",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error(response.error.description || "Payment failed");
      });
      rzp.open();
    } catch (e) {
      toast.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Your Subscription</h2>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow effect */}
        {plan === 'pro' && (
          <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none" />
        )}
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Current Plan: <span className={plan === 'pro' ? 'text-[#D4AF37] uppercase font-bold' : 'text-white capitalize'}>{plan}</span></h3>
          <p className="text-gray-400 max-w-sm">
            {plan === 'pro' 
              ? 'You have unlimited access to all features. Thank you for using Arjuna Table.'
              : 'You are currently on the free plan, limited to 5 tables.'}
          </p>
        </div>

        {plan === 'free' && (
          <Button onClick={handleUpgrade} disabled={loading} className="py-4 px-8 shrink-0">
            {loading ? 'Processing...' : 'Upgrade to Pro - ₹499'}
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 border border-[#222] rounded-xl">
          <h4 className="font-bold mb-4 text-gray-300">Free Plan</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">✓ Up to 5 Tables</li>
            <li className="flex items-center gap-2">✓ Basic Menu Items</li>
            <li className="flex items-center gap-2">✓ Live Order Dashboard</li>
            <li className="flex items-center gap-2">✗ No PDF Invoices</li>
            <li className="flex items-center gap-2">✗ No Admin Support</li>
          </ul>
        </div>
        <div className="p-6 border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-xl">
          <h4 className="font-bold mb-4 text-[#D4AF37]">Pro Plan</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-2">✓ Unlimited Tables</li>
            <li className="flex items-center gap-2">✓ Unlimited Menu Items</li>
            <li className="flex items-center gap-2">✓ Live Order Dashboard</li>
            <li className="flex items-center gap-2">✓ Downloadable PDF Invoices</li>
            <li className="flex items-center gap-2">✓ Priority Support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
