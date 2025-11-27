import React from "react";

const GeminiIcon = ({ size = 24, className = "", style = {} }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="25%" stopColor="#34A853" />
          <stop offset="50%" stopColor="#FBBC04" />
          <stop offset="75%" stopColor="#FF6D01" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="url(#geminiGradient)"
        stroke="url(#geminiGradient)"
        strokeWidth="0.5"
      />
    </svg>
  );
};

export default GeminiIcon;

