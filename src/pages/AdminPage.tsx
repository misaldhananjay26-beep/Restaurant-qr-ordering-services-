import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.currentUser?.email !== 'misaldhananjay26@gmail.com') return;

    const fetchAll = async () => {
      try {
        const restSnap = await getDocs(collection(db, 'restaurants'));
        setRestaurants(restSnap.docs.map(d => ({id: d.id, ...d.data()})));
        
        const subSnap = await getDocs(collection(db, 'subscriptions'));
        setSubscriptions(subSnap.docs.map(d => ({id: d.id, ...d.data()})));
      } catch (e) {
        console.error(e);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (auth.currentUser?.email !== 'misaldhananjay26@gmail.com') {
    return <Navigate to="/dashboard/orders" />;
  }

  if (loading) return <div className="text-gray-400">Loading admin panel...</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#D4AF37]">Super Admin Panel</h2>
        <p className="text-gray-400">Welcome back, Dhananjay.</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#1A1A1A] border-b border-[#333] text-gray-400">
            <tr>
              <th className="p-4 font-medium">Restaurant</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {restaurants.map(rest => {
              const sub = subscriptions.find(s => s.restaurantId === rest.id);
              return (
                <tr key={rest.id} className="hover:bg-[#1A1A1A]">
                  <td className="p-4 text-white font-medium">{rest.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${rest.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {rest.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    {sub ? (
                      <span className={`px-2 py-1 rounded text-xs border ${sub.plan === 'pro' ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] text-gray-400 bg-[#222]'}`}>
                        {sub.plan.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {restaurants.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500 font-medium">
                  No restaurants registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
