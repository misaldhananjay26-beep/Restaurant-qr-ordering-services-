import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { QrCode, Zap, Smartphone, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black font-sans">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5 relative z-10">
        <h1 className="text-2xl font-bold tracking-tighter">
          <span className="text-[#D4AF37]">Arjuna</span>Table
        </h1>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log In</Link>
          <Link to="/login">
            <Button className="px-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center relative overflow-hidden">
        {/* Abstract Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-sm font-medium tracking-wide">
            Next-Gen Restaurant Tech
          </div>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
            Scan. Order. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#D4AF37]">
              Serve Faster.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The premium QR-based restaurant ordering system. No apps to download, no waiting for waiters. Give your guests the VIP treatment they deserve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button className="pl-6 pr-4 py-4 text-lg group flex items-center gap-2 relative overflow-hidden">
                <span className="relative z-10">Start Free Trial</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/menu?restaurant=demo&table=1">
              <Button variant="secondary" className="px-8 py-4 text-lg">View Demo Menu</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Precision Engineered</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to streamline operations and increase revenue, packed into a beautiful interface.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<QrCode size={28} />}
            title="Instant QR Menus"
            desc="Generate and print beautiful, scannable menus that update in real-time."
          />
          <FeatureCard 
            icon={<Zap size={28} />}
            title="Live Kitchen Dashboard"
            desc="Orders stream in instantly. Manage the flow from pending to served seamlessly."
          />
          <FeatureCard 
            icon={<Smartphone size={28} />}
            title="No App Required"
            desc="Frictionless browser-based ordering that feels like a native app experience."
          />
        </div>
      </section>

      {/* Footer / Team Section */}
      <footer className="border-t border-[#222] bg-[#050505] py-12 mt-12 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-xl font-bold tracking-tighter mb-4 text-[#D4AF37]">ArjunaTable</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Empowering restaurants with modern, seamless, and efficient digital ordering solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10">
            <a href="https://wa.me/918767103423" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#25D366] transition-colors font-medium">
              <Smartphone size={18} />
              +91 8767103423
            </a>
            <a href="mailto:misaldhananjay26@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              misaldhananjay26@gmail.com
            </a>
          </div>
          
          <div className="pt-8 border-t border-white/5 inline-block">
            <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest font-semibold">Built by </p>
            <div className="flex flex-wrap justify-center gap-4 text-white font-medium">
              <span className="hover:text-[#D4AF37] transition-colors">Dhananjay Misal</span>
              <span className="text-gray-600">•</span>
              <span className="hover:text-[#D4AF37] transition-colors">Aditya Shirke</span>
              <span className="text-gray-600">•</span>
              <span className="hover:text-[#D4AF37] transition-colors">Swastik Rasal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#0A0A0A] p-8 rounded-2xl border border-[#222] hover:border-[#D4AF37] transition-colors duration-300 group">
      <div className="w-14 h-14 bg-[#111] text-[#D4AF37] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
