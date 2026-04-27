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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 print:grid-cols-3 print:gap-8">
        {Array.from({ length: tableCount }).map((_, i) => {
          const tableNum = i + 1;
          const url = generateQrUrl(tableNum);
          
          return (
            <div key={tableNum} className="bg-white p-6 rounded-xl flex flex-col items-center border-4 border-[#D4AF37]/20 print:border-[#000]">
              <div className="mb-4 text-black text-center">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Scan to order</p>
                <h3 className="font-bold text-2xl">Table {tableNum}</h3>
              </div>
              
              <div className="bg-white p-2 border-2 border-dashed border-gray-200 rounded-lg">
                <QRCodeSVG 
                  value={url} 
                  size={120}
                  level="Q"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-400 font-medium">ArjunaTable.com</p>
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
