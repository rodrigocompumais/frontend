import React from "react";

// Tentar importar de hi2, se não existir usar hi
let HiSparkles;
try {
  const hi2 = require("react-icons/hi2");
  HiSparkles = hi2.HiSparkles;
} catch {
  try {
    const hi = require("react-icons/hi");
    HiSparkles = hi.HiSparkles;
  } catch {
    // Fallback: criar um componente vazio se não encontrar
    HiSparkles = () => <span>✨</span>;
  }
}

const GeminiIcon = ({ size = 24, className = "", style = {} }) => {
  const gradientId = "sparkle-gradient-blue";
  
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          ...style
        }}
        className={className}
      >
        <HiSparkles 
          size={size}
          style={{
            display: 'block',
            fill: `url(#${gradientId})`,
          }}
        />
      </span>
    </>
  );
};

export default GeminiIcon;

