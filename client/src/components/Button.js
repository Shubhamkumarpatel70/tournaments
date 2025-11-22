import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick, 
  className = '',
  type = 'button',
  disabled = false 
}) => {
  const baseStyles = 'font-bold rounded-lg transition-all duration-300 transform relative overflow-hidden';
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-3',
  };
  
  const variants = {
    primary: `
      bg-lava-gradient text-lava-black border-none
      hover:bg-lava-gradient-reverse hover:scale-105 hover:shadow-lava-glow-intense
      animate-pulse-glow
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    secondary: `
      bg-transparent text-off-white border-2 border-lava-orange
      hover:bg-lava-orange hover:text-lava-black hover:shadow-lava-glow
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    registration: `
      bg-magenta-orange text-white border-none
      hover:scale-105 hover:shadow-lava-glow-intense
      animate-pulse-glow
      hover:uppercase
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    danger: `
      bg-transparent text-red-500 border-2 border-red-500
      hover:bg-red-500 hover:text-white
      disabled:opacity-50 disabled:cursor-not-allowed
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

