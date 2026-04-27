import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const defaultItem = { name: '', price: '', category: '', active: true, image: '', description: '', isVeg: true };
  const [newItem, setNewItem] = useState(defaultItem);

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

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setNewItem({ ...newItem, image: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, 'menus', editingId), {
          name: newItem.name,
          price: Number(newItem.price),
          category: newItem.category || 'General',
          image: newItem.image,
          description: newItem.description,
          isVeg: newItem.isVeg,
          active: newItem.active,
        });
        toast.success('Item updated');
      } else {
        const id = Date.now().toString();
        await setDoc(doc(db, 'menus', id), {
          restaurantId: auth.currentUser.uid,
          name: newItem.name,
          price: Number(newItem.price),
          category: newItem.category || 'General',
          image: newItem.image,
          description: newItem.description,
          isVeg: newItem.isVeg,
          active: newItem.active,
          createdAt: serverTimestamp()
        });
        toast.success('Item added');
      }
      
      setShowAdd(false);
      setEditingId(null);
      setNewItem(defaultItem);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save item: ' + err?.message);
    }
  };

  const startEdit = (item: any) => {
    setNewItem({
      name: item.name,
      price: String(item.price),
      category: item.category,
      active: item.active,
      image: item.image || '',
      description: item.description || '',
      isVeg: item.isVeg ?? true,
    });
    setEditingId(item.id);
    setShowAdd(true);
  };

  const cancelEdit = () => {
    setShowAdd(false);
    setEditingId(null);
    setNewItem(defaultItem);
    setDeletingId(null);
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
    try {
      await deleteDoc(doc(db, 'menus', id));
      toast.success('Item deleted');
      setDeletingId(null);
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
        <Button onClick={() => showAdd ? cancelEdit() : setShowAdd(true)}>
          {showAdd ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleSave} className="bg-[#111] border border-[#222] p-6 rounded-xl mb-8 space-y-4">
          <div className="flex justify-between items-center bg-[#1A1A1A] -mx-6 -mt-6 p-4 border-b border-[#333] mb-4 rounded-t-xl">
             <h3 className="font-bold text-lg text-[#D4AF37]">{editingId ? 'Edit Menu Item' : 'New Menu Item'}</h3>
          </div>
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
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Image</label>
              
              <div 
                className="w-full relative border-2 border-dashed border-[#333] hover:border-[#D4AF37] rounded-xl p-4 flex flex-col items-center justify-center transition-colors min-h-[120px] bg-[#1A1A1A] cursor-pointer overflow-hidden group"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#D4AF37]', 'bg-[#222]') }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#D4AF37]', 'bg-[#222]') }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-[#D4AF37]', 'bg-[#222]');
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleImageUpload(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input 
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />
                
                {newItem.image ? (
                  <div className="flex gap-4 items-center w-full">
                     <img src={newItem.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-[#333]" />
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-medium text-white truncate">Image Selected</p>
                       <p className="text-xs text-gray-500 mt-1">Click or drag a new image to replace</p>
                     </div>
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#222] text-[#D4AF37] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 mb-3">
                 <div className="h-[1px] flex-1 bg-[#333]"></div>
                 <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">OR</span>
                 <div className="h-[1px] flex-1 bg-[#333]"></div>
              </div>
              <input value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white outline-none focus:border-[#D4AF37] text-sm" placeholder="Paste an image URL..." />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
              <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white outline-none focus:border-[#D4AF37]" placeholder="Delicious detailed description..." rows={2} />
            </div>
            <div className="col-span-2 flex items-center space-x-2 mt-2">
              <input type="checkbox" id="isVeg" checked={newItem.isVeg} onChange={e => setNewItem({...newItem, isVeg: e.target.checked})} className="w-4 h-4 accent-[#D4AF37]" />
              <label htmlFor="isVeg" className="text-sm font-medium text-gray-300">Is Vegetarian</label>
            </div>
          </div>
          <Button type="submit" className="w-full mt-4">{editingId ? 'Update Item' : 'Save Item'}</Button>
        </form>
      )}

      {items.length === 0 && !showAdd && (
        <div className="py-12 text-center text-gray-500 border border-dashed border-[#333] rounded-xl flex flex-col justify-center items-center gap-4">
          <p>No items in your menu yet.</p>
          <Button variant="secondary" onClick={() => setShowAdd(true)}>Add your first item</Button>
        </div>
      )}

      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center p-4 bg-[#111] border border-[#222] rounded-xl gap-4 flex-col sm:flex-row">
            <div className="w-full sm:w-16 h-16 rounded-lg bg-[#222] flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500 text-center overflow-hidden relative">
               {item.image ? (
                 <img 
                   src={item.image} 
                   alt={item.name} 
                   className="w-full h-full object-cover" 
                   onError={(e) => {
                     e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                   }}
                 />
               ) : (
                 <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" alt="placeholder" className="opacity-30 w-full h-full object-cover grayscale" />
               )}
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {item.name}
                  <span className={`inline-block w-3 h-3 rounded-full border ${item.isVeg ? 'border-green-600 bg-green-500/20' : 'border-red-600 bg-red-500/20'} relative`}>
                    <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                  </span>
                </h3>
                {!item.active && <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Hidden</span>}
              </div>
              <p className="text-[#D4AF37] text-sm font-medium mt-1">{item.category} • ₹{item.price}</p>
              {item.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-[#222] sm:border-0">
              {deletingId === item.id ? (
                <div className="flex gap-2">
                  <Button variant="secondary" className="text-red-400 hover:text-red-300 hover:border-red-400" onClick={() => handleDelete(item.id)}>Confirm</Button>
                  <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => toggleStatus(item.id, item.active)}>
                    {item.active ? 'Hide' : 'Show'}
                  </Button>
                  <Button variant="secondary" onClick={() => startEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="secondary" className="text-red-400 hover:text-red-300 hover:border-red-400" onClick={() => setDeletingId(item.id)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
