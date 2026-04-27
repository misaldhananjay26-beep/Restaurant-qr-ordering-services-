import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../components/ui/Button';
import { auth } from '../lib/firebase';
import { Download, Printer } from 'lucide-react';

export default function QrCodesPage() {
  const [tableCount, setTableCount] = useState(10);
  
  const generateQrUrl = (tableNum: number) => {
    const baseUrl = window.location.origin;
    const restId = auth.currentUser?.uid || 'demo';
    return `${baseUrl}/menu?restaurant=${restId}&table=${tableNum}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">QR Codes</h2>
          <p className="text-gray-400">Print QR codes for your tables.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#111] p-1 border border-[#222] rounded-lg">
            <span className="text-sm text-gray-400 pl-3">Tables:</span>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={tableCount} 
              onChange={(e) => setTableCount(Number(e.target.value) || 1)}
              className="w-16 bg-transparent text-white font-bold p-2 outline-none text-center"
            />
          </div>
          <Button onClick={handlePrint} className="flex items-center gap-2 print:hidden">
            <Printer size={18} />
            Print All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 print:grid-cols-3 print:gap-8">
        {Array.from({ length: tableCount }).map((_, i) => {
          const tableNum = i + 1;
          const url = generateQrUrl(tableNum);
          
          return (
            <div key={tableNum} className="group relative bg-[#111] p-1 rounded-2xl print:bg-white print:p-0">
              {/* Animated Gradient Border Layer (Screen Only) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#B8860B] rounded-2xl opacity-50 blur-sm group-hover:opacity-100 transition-opacity duration-500 print:hidden" />
              
              {/* Main Card */}
              <div className="relative bg-[#0A0A0A] print:bg-white h-full rounded-xl flex flex-col items-center border border-[#333] print:border-4 print:border-[#000] overflow-hidden">
                {/* Decorative Pattern Background */}
                <div className="absolute inset-0 opacity-[0.03] print:opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

                <div className="w-full bg-gradient-to-b from-[#1A1A1A] to-transparent print:from-white p-6 pb-2 text-center relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] print:text-gray-500 font-bold mb-2">Scan to order</p>
                  <h3 className="font-extrabold text-3xl text-white print:text-black tracking-tight">TABLE {tableNum}</h3>
                </div>
                
                <div className="p-6 relative z-10 w-full flex justify-center">
                  <div className="bg-white p-4 rounded-xl shadow-2xl shadow-black/50 print:shadow-none ring-4 ring-[#D4AF37]/20 print:ring-[#000]">
                    <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                      <QRCodeSVG 
                        value={url} 
                        size={160}
                        level="H"
                        fgColor="#111111"
                        bgColor="#ffffff"
                        imageSettings={{
                          src: "https://api.iconify.design/lucide:utensils-crossed.svg?color=%23D4AF37",
                          x: undefined,
                          y: undefined,
                          height: 32,
                          width: 32,
                          excavate: true,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full mt-auto p-4 bg-gradient-to-t from-[#D4AF37]/10 to-transparent print:bg-white text-center relative z-10">
                  <p className="text-xs font-semibold tracking-widest text-[#D4AF37] print:text-black">ARJUNATABLE.COM</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; color: black; }
          nav, aside, button, header { display: none !important; }
          main { background: white !important; margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  );
}
