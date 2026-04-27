import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error(error);
      toast.error("Failed to load orders");
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const generateInvoice = (order: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Arjuna Table Invoice", 20, 20);

    doc.setFontSize(12);
    doc.text(`Table: ${order.tableNumber}`, 20, 40);
    doc.text(`Order ID: ${order.id}`, 20, 50);
    doc.text(`Date: ${format(order.createdAt?.toDate ? order.createdAt.toDate() : new Date(), 'PPpp')}`, 20, 60);

    let y = 80;
    doc.text("Items:", 20, y);
    y += 10;
    
    order.items.forEach((item: any) => {
      doc.text(`${item.name} x${item.qty} - INR ${item.price}`, 20, y);
      y += 10;
    });

    doc.text(`Total: INR ${order.total}`, 20, y + 10);
    doc.save(`invoice-${order.id}.pdf`);
  };

  if (loading) return <div className="text-gray-400">Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Live Orders</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-[#333] rounded-xl">
            No active orders right now.
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#D4AF37]">Table {order.tableNumber}</h3>
                  <p className="text-xs text-gray-500">{format(order.createdAt?.toDate ? order.createdAt.toDate() : new Date(), 'h:mm a')}</p>
                </div>
                <StatusBadge status={order.status} />
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
