import React from "react";
import { Copy } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl bg-[#E78F81] text-white text-lg font-bold hover:opacity-90 transition w-full ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;