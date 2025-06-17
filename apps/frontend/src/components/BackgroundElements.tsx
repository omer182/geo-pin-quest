import React from 'react';

// Animated world map background with floating pins
export const WorldMapBackground: React.FC = () => (
  <div className="absolute inset-0 opacity-20">
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 1200 600" 
      className="text-white"
      style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
    >
      {/* Simplified world continents */}
      <g className="animate-pulse" style={{ animationDuration: '6s' }}>
        {/* North America */}
        <path 
          d="M150,120 Q200,100 280,130 Q320,110 380,140 L420,160 Q450,180 480,160 L520,170 Q550,150 580,170 L600,180 Q630,200 650,180 L680,190" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          opacity="0.6"
        />
        
        {/* Europe */}
        <path 
          d="M580,120 Q620,100 660,120 Q700,110 740,130 L780,140 Q810,120 840,140" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          opacity="0.6"
        />
        
        {/* Asia */}
        <path 
          d="M740,100 Q800,80 880,110 Q920,90 980,120 L1020,140 Q1060,160 1100,140 L1150,150" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          opacity="0.6"
        />
        
        {/* South America */}
        <path 
          d="M200,300 Q250,280 300,310 Q350,330 400,350 L450,380 Q480,400 500,380 L520,390 Q540,410 560,390" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          opacity="0.6"
        />
        
        {/* Africa */}
        <path 
          d="M580,220 Q620,200 660,230 Q700,250 740,280 L780,320 Q810,350 840,330 L860,340" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          opacity="0.6"
        />
        
        {/* Australia */}
        <path 
          d="M920,380 Q960,370 1000,385 Q1040,395 1080,385" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          opacity="0.6"
        />
      </g>
      
      {/* Animated location pins */}
      <g className="text-red-300">
        <circle cx="300" cy="150" r="4" fill="currentColor" className="animate-ping" style={{ animationDelay: '0s' }} />
        <circle cx="500" cy="130" r="4" fill="currentColor" className="animate-ping" style={{ animationDelay: '1s' }} />
        <circle cx="700" cy="180" r="4" fill="currentColor" className="animate-ping" style={{ animationDelay: '2s' }} />
        <circle cx="900" cy="200" r="4" fill="currentColor" className="animate-ping" style={{ animationDelay: '3s' }} />
        <circle cx="350" cy="320" r="4" fill="currentColor" className="animate-ping" style={{ animationDelay: '4s' }} />
        <circle cx="750" cy="280" r="4" fill="currentColor" className="animate-ping" style={{ animationDelay: '5s' }} />
      </g>
      
      {/* Grid lines for geographic feel */}
      <g className="opacity-20">
        <line x1="0" y1="150" x2="1200" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="0" y1="300" x2="1200" y2="300" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="0" y1="450" x2="1200" y2="450" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="300" y1="0" x2="300" y2="600" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="600" y1="0" x2="600" y2="600" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="900" y1="0" x2="900" y2="600" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
      </g>
    </svg>
  </div>
);

// 3D Globe with floating pins
export const Globe3D: React.FC = () => (
  <div className="absolute top-1/2 right-10 transform -translate-y-1/2 hidden lg:block">
    <div className="relative w-48 h-48">
      {/* Main globe */}
      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 shadow-2xl relative overflow-hidden animate-spin" style={{ animationDuration: '20s' }}>
        {/* Continents overlay */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-300/40 via-yellow-200/30 to-green-500/40"></div>
        
        {/* Latitude lines */}
        <div className="absolute top-1/4 left-2 right-2 h-px bg-white/30"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40"></div>
        <div className="absolute top-3/4 left-2 right-2 h-px bg-white/30"></div>
        
        {/* Longitude curves */}
        <div className="absolute top-2 bottom-2 left-1/4 w-px bg-white/30 rounded-full"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40"></div>
        <div className="absolute top-2 bottom-2 left-3/4 w-px bg-white/30 rounded-full"></div>
        
        {/* Highlight effect */}
        <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/30 blur-md"></div>
        <div className="absolute top-8 left-8 w-6 h-6 rounded-full bg-white/50 blur-sm"></div>
      </div>
      
      {/* Floating pins around globe */}
      <div className="absolute -top-3 left-1/3 text-red-400 text-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
        📍
      </div>
      <div className="absolute top-1/4 -right-3 text-red-400 text-lg animate-bounce" style={{ animationDelay: '1.5s' }}>
        📍
      </div>
      <div className="absolute bottom-1/3 -left-3 text-red-400 text-lg animate-bounce" style={{ animationDelay: '2.5s' }}>
        📍
      </div>
      <div className="absolute bottom-6 right-1/4 text-red-400 text-lg animate-bounce" style={{ animationDelay: '3.5s' }}>
        📍
      </div>
    </div>
  </div>
);

// Floating geographic elements (simplified - removed corner text and flickering dots)
export const FloatingElements: React.FC = () => (
  <>
    {/* Removed all corner decorations and floating particles for cleaner look */}
  </>
);
