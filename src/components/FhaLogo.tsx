import React from 'react';

interface FhaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export function FhaLogo({ className = '', size = '100%', showText = true }: FhaLogoProps) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      width={size} 
      height={size} 
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Transparency Mask for clean notched cuts in any background */}
        <mask id="fhaLogoMask">
          {/* Everything white stays visible */}
          <circle cx="100" cy="100" r="100" fill="#ffffff" />
          
          {/* Black notch rectangles cut out from the circle */}
          {/* Top Notch */}
          <rect x="91" y="0" width="18" height="12" fill="#000000" />
          {/* Bottom Notch */}
          <rect x="91" y="188" width="18" height="12" fill="#000000" />
          {/* Left Notch */}
          <rect x="0" y="91" width="12" height="18" fill="#000000" />
          {/* Right Notch */}
          <rect x="188" y="91" width="12" height="18" fill="#000000" />
        </mask>

        {/* Text Paths precisely centered inside the green ring (radius 82, midway between 70 and 94) */}
        {/* Top path curves clockwise from left (18, 100) to right (182, 100) */}
        <path 
          id="fhaTextPathTop" 
          d="M 18 100 A 82 82 0 0 1 182 100" 
          fill="none" 
          stroke="none" 
        />
        
        {/* Bottom path curves clockwise from right (182, 100) to left (18, 100) */}
        {/* This keeps letters oriented pointing outwards, reading right-to-left along the path (which is left-to-right on the page when the text is reversed) */}
        <path 
          id="fhaTextPathBottom" 
          d="M 182 100 A 82 82 0 0 1 18 100" 
          fill="none" 
          stroke="none" 
        />
      </defs>

      {/* Outer Ring with FHA Green, clipped by the notch mask */}
      <circle cx="100" cy="100" r="94" fill="#1D7033" mask="url(#fhaLogoMask)" />
      
      {/* Inner White circle containing the FHA structure */}
      <circle cx="100" cy="100" r="70" fill="#ffffff" stroke="#1D7033" strokeWidth="4.5" />
      
      {/* Curved Text inside the Green Ring */}
      {showText && (
        <g>
          {/* Top text: FEDERAL HOUSING AUTHORITY */}
          <text 
            fill="#ffffff" 
            fontSize="10" 
            fontWeight="800" 
            fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
            letterSpacing="0.06em"
          >
            <textPath href="#fhaTextPathTop" startOffset="50%" textAnchor="middle">
              FEDERAL HOUSING AUTHORITY
            </textPath>
          </text>

          {/* Bottom text: NIGERIA */}
          {/* Reversed to AIREGIn to read left-to-right on the clockwise bottom-up path */}
          <text 
            fill="#ffffff" 
            fontSize="11" 
            fontWeight="800" 
            fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
            letterSpacing="0.18em"
          >
            <textPath href="#fhaTextPathBottom" startOffset="50%" textAnchor="middle">
              AIREGIn
            </textPath>
          </text>
        </g>
      )}
      
      {/* Central icon: FHA stylized housing structure */}
      <g transform="translate(100, 104) scale(0.85)">
        {/* Roof (Triangle) */}
        <polygon points="-45,-15 45,-15 0,-38" fill="#212529" stroke="#212529" strokeWidth="1" strokeLinejoin="round" />
        {/* Support line right under roof */}
        <line x1="-38" y1="-15" x2="38" y2="-15" stroke="#212529" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Stylized structural frame (Intersecting hourglass / Columns) */}
        <line x1="-30" y1="-15" x2="30" y2="40" stroke="#212529" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="30" y1="-15" x2="-30" y2="40" stroke="#212529" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="-15" y1="-15" x2="0" y2="12" stroke="#212529" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="15" y1="-15" x2="0" y2="12" stroke="#212529" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Bottom horizontal base */}
        <line x1="-38" y1="40" x2="38" y2="40" stroke="#212529" strokeWidth="4.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
