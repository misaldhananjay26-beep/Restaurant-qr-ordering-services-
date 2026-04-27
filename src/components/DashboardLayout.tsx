import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, CreditCard, LogOut, QrCode, Shield } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAdmin = auth.currentUser?.email === 'misaldhananjay26@gmail.com';

  const navItems = [
    { name: 'Live Orders', path: '/dashboard/orders', icon: <LayoutDashboard size={20} /> },
    { name: 'Menu', path: '/dashboard/menu', icon: <UtensilsCrossed size={20} /> },
    { name: 'QR Codes', path: '/dashboard/qrcodes', icon: <QrCode size={20} /> },
    { name: 'Subscription', path: '/dashboard/subscription', icon: <CreditCard size={20} /> },
    ...(isAdmin ? [{ name: 'Super Admin', path: '/dashboard/admin', icon: <Shield size={20} /> }] : []),
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row text-white">
      {/* Sidebar Desktop / Topbar Mobile */}
      <aside className="w-full md:w-64 border-b md:border-r border-[#222] bg-[#0A0A0A] flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-[#D4AF37]">Arjuna<span className="text-white">Table</span></h1>
        </div>
        
        <nav className="flex-1 px-4 md:py-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#1A1A1A] text-[#D4AF37] border border-[#333]' 
                    : 'text-gray-400 hover:text-white hover:bg-[#111]'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 hidden md:block">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#111] rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#050505]">
        <div className="h-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
