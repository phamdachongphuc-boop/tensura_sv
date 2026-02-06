
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  // Added 'group' 'overflow-hidden' and 'shine-effect' logic
  const baseStyles = "relative px-6 py-2 rounded font-bold transition-all duration-200 rpg-font tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 overflow-hidden group";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400 hover:shadow-[0_0_25px_rgba(37,99,235,0.8)] shine-effect",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-500 hover:border-slate-300 shine-effect",
    danger: "bg-red-800 hover:bg-red-700 text-red-100 border border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] shine-effect",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 border border-transparent hover:border-slate-600"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </span>
        ) : children}
      </div>
      
      {/* Additional Glow for Primary/Danger on Hover - Pure CSS handling via group-hover if needed, but the shine-effect class handles the sweep */}
    </button>
  );
};