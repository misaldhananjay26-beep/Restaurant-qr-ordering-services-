import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevOrdersCount, setPrevOrdersCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const rootPath = 'orders';
    const q = query(collection(db, rootPath), where('restaurantId', '==', auth.currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      const newPendingCount = ordersData.filter(o => o.status === 'pending').length;
      
      setOrders(ordersData);
      setLoading(false);
      
      // Basic sound notification comparison
      if (newPendingCount > prevOrdersCount && soundEnabled) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log('Audio play blocked:', e));
        } catch(e) {}
      }
      setPrevOrdersCount(newPendingCount);
      
    }, (error) => {
      console.error(error);
      toast.error("Failed to load orders");
    });

    return () => unsubscribe();
  }, [prevOrdersCount, soundEnabled]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
       await deleteDoc(doc(db, 'orders', orderId));
       toast.success("Order removed from list");
    } catch (error) {
       toast.error("Failed to remove order");
    }
  };

  const generateInvoice = (order: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // Receipt-like format
    });
    
    // Background
    doc.setFillColor(17, 17, 17);
    doc.rect(0, 0, 80, 200, 'F');
    
    // Header
    doc.setTextColor(212, 175, 55); // #D4AF37 Gold
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("ARJUNA TABLE", 40, 15, { align: "center" });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("PREMIUM DINING EXPERIENCE", 40, 20, { align: "center" });

    // Divider
    doc.setDrawColor(51, 51, 51);
    doc.setLineWidth(0.5);
    doc.line(5, 25, 75, 25);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Table No: ${order.tableNumber}`, 5, 32);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Date: ${format(order.createdAt?.toDate ? order.createdAt.toDate() : new Date(), 'dd MMM yyyy, h:mm a')}`, 5, 38);
    doc.text(`Order ID: ${order.id.slice(-6).toUpperCase()}`, 5, 43);

    doc.line(5, 48, 75, 48);

    // Items
    let y = 55;
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("Qty", 5, y);
    doc.text("Item", 15, y);
    doc.text("Amt", 75, y, { align: "right" });
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    
    order.items.forEach((item: any) => {
      doc.setTextColor(255, 255, 255);
      doc.text(`${item.qty}`, 5, y);
      
      // Handle long item names
      const splitName = doc.splitTextToSize(item.name, 45);
      doc.text(splitName, 15, y);
      
      doc.text(`INR ${item.price * item.qty}`, 75, y, { align: "right" });
      
      y += (splitName.length * 4) + 2;
    });

    y += 2;
    doc.line(5, y, 75, y);
    
    y += 8;
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL", 5, y);
    doc.text(`INR ${order.total}`, 75, y, { align: "right" });

    y += 15;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("Thank you for dining with us!", 40, y, { align: "center" });

    doc.save(`Arjuna-Receipt-${order.id.slice(-6)}.pdf`);
  };

  if (loading) return <div className="text-gray-400">Loading orders...</div>;

  const todayRevenue = orders
    .filter(o => o.status === 'served')
    .reduce((acc, curr) => acc + curr.total, 0);
    
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Live Orders</h2>
          <p className="text-gray-400">Manage incoming requests</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => setSoundEnabled(!soundEnabled)} className="text-sm">
            Sound: {soundEnabled ? 'ON 🔊' : 'OFF 🔇'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
           <p className="text-sm text-gray-500 mb-1">Today's Revenue</p>
           <p className="text-2xl font-bold text-[#D4AF37]">₹{todayRevenue}</p>
         </div>
         <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
           <p className="text-sm text-gray-500 mb-1">Total Orders</p>
           <p className="text-2xl font-bold">{orders.length}</p>
         </div>
         <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
           <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
           <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
         </div>
         <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
           <p className="text-sm text-gray-500 mb-1">Served Orders</p>
           <p className="text-2xl font-bold text-green-500">{orders.filter(o => o.status === 'served').length}</p>
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orders.length === 0 ? (
          <div className="col-span-full py-16 px-4 text-center border-2 border-dashed border-[#222] bg-[#111]/50 rounded-2xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4 text-[#D4AF37]">
              <span>🍽️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">No active orders</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Orders placed by customers will appear here in real-time. Make sure your volume is up for notifications.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#D4AF37]">Table {order.tableNumber}</h3>
                  <p className="text-xs text-gray-500">{format(order.createdAt?.toDate ? order.createdAt.toDate() : new Date(), 'h:mm a')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  {order.status === 'served' && (
                    <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 text-gray-500 hover:text-red-400 bg-[#222] hover:bg-red-500/10 rounded-md transition-colors" title="Remove from list">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 mb-6 space-y-3">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      <span className="text-white font-medium mr-2">{item.qty}x</span>
                      {item.name}
                    </span>
                    <span className="text-gray-400">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#222] mb-6">
                <span className="font-medium text-gray-400">Total</span>
                <span className="text-xl font-bold">₹{order.total}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {order.status === 'pending' && (
                  <Button className="flex-1" onClick={() => updateStatus(order.id, 'preparing')}>
                    Accept & Prepare
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(order.id, 'served')}>
                    Mark as Served
                  </Button>
                )}
                {order.status === 'served' && (
                  <Button variant="secondary" className="flex-1" onClick={() => generateInvoice(order)}>
                    Download Invoice
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    preparing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    served: 'bg-green-500/10 text-green-500 border-green-500/20',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}
