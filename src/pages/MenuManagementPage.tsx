import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fake form states for simplicity
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '', active: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'menus'), where('restaurantId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, 'menus', id), {
        restaurantId: auth.currentUser.uid,
        name: newItem.name,
        price: Number(newItem.price),
        category: newItem.category || 'General',
        image: newItem.image,
        active: newItem.active,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewItem({ name: '', price: '', category: '', active: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' });
      toast.success('Item added');
      fetchItems();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to add item: ' + err?.message);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'menus', id), { active: !current });
      fetchItems();
    } catch (e) {
      toast.error('Failed to update status');
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'menus', id));
      toast.success('Item deleted');
      fetchItems();
    } catch (e) {
      toast.error('Failed to delete item');
    }
  };

  if (loading) return <div className="text-gray-400">Loading menu...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-[#111] border border-[#222] p-6 rounded-xl mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white outline-none focus:border-[#D4AF37]" placeholder="e.g. Truffle Fries" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
              <input required type="number" min="0" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white outline-none focus:border-[#D4AF37]" placeholder="e.g. 299" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <input value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white outline-none focus:border-[#D4AF37]" placeholder="e.g. Starters" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm text-gray-400 mb-1">Image URL</label>
              <input value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white outline-none focus:border-[#D4AF37]" placeholder="https://..." />
            </div>
          </div>
          <Button type="submit" className="w-full">Save Item</Button>
        </form>
      )}

      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center p-4 bg-[#111] border border-[#222] rounded-xl gap-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-gray-400 text-sm">{item.category} • ₹{item.price}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="secondary" onClick={() => toggleStatus(item.id, item.active)}>
                {item.active ? 'Hide' : 'Show'}
              </Button>
              <Button variant="secondary" className="text-red-400 hover:text-red-300 hover:border-red-400" onClick={() => handleDelete(item.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
