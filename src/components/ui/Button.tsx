import React from 'react';
export function Button({ 
  children, variant = 'primary', className = '', ...props 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  [key: string]: any;
}) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#D4AF37] text-black hover:bg-[#C2A032] shadow-[0_0_15px_rgba(212,175,55,0.2)]",
    secondary: "border border-[#333] hover:border-[#D4AF37] hover:text-[#D4AF37] text-white bg-transparent",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5"
  };

  const sizes = "px-4 py-2 text-sm";

  return (
    <button className={`${base} ${variants[variant]} ${sizes} ${className}`} {...props}>
      {children}
    </button>
  );
}
