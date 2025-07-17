import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PerformanceData {
  good: number;
  neutral: number; 
  bad: number;
  goodCount?: number;
  neutralCount?: number;
  badCount?: number;
}

interface StatusBarTooltipProps {
  performance: PerformanceData;
  children: React.ReactNode;
  totalCalls?: number;
}

export function StatusBarTooltip({ performance, children, totalCalls }: StatusBarTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  // Calculate counts if not provided, ensuring they add up to totalCalls
  let goodCount, neutralCount, badCount;
  
  if (performance.goodCount !== undefined && performance.neutralCount !== undefined && performance.badCount !== undefined) {
    goodCount = performance.goodCount;
    neutralCount = performance.neutralCount;
    badCount = performance.badCount;
  } else if (totalCalls) {
    // Calculate based on percentages
    goodCount = Math.round((performance.good / 100) * totalCalls);
    neutralCount = Math.round((performance.neutral / 100) * totalCalls);
    badCount = totalCalls - goodCount - neutralCount; // Ensure total adds up
  } else {
    // Fallback calculation - usar contagens diretas das porcentagens
    goodCount = performance.good;
    neutralCount = performance.neutral;
    badCount = performance.bad;
  }

  // Recalculate percentages to be precise
  const actualTotal = goodCount + neutralCount + badCount;
  const goodPercentage = actualTotal > 0 ? (goodCount / actualTotal) * 100 : 0;
  const neutralPercentage = actualTotal > 0 ? (neutralCount / actualTotal) * 100 : 0;
  const badPercentage = actualTotal > 0 ? (badCount / actualTotal) * 100 : 0;

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10,
        left: rect.right - 200 // Aproximadamente a largura do tooltip
      });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipContent = (
    <div 
      className={`fixed bg-white border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.1)] rounded-lg p-4 max-w-xs transition-all duration-200 z-[999999] ${
        isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#5cb868] rounded-full"></div>
            <span className="text-[#373753] text-sm font-medium">Bom:</span>
          </div>
          <span className="text-[#677c92] text-sm text-right">
            {goodCount} ({goodPercentage.toFixed(2)}%)
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ffbd00] rounded-full"></div>
            <span className="text-[#373753] text-sm font-medium">Neutro:</span>
          </div>
          <span className="text-[#677c92] text-sm text-right">
            {neutralCount} ({neutralPercentage.toFixed(2)}%)
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#dc2f1c] rounded-full"></div>
            <span className="text-[#373753] text-sm font-medium">Ruim:</span>
          </div>
          <span className="text-[#677c92] text-sm text-right">
            {badCount} ({badPercentage.toFixed(2)}%)
          </span>
        </div>

        {/* Progress bar at the bottom */}
        <div className="pt-2">
          <div className="flex h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#5cb868] rounded-l-full" 
              style={{ width: `${goodPercentage}%` }}
            ></div>
            <div 
              className="bg-[#ffbd00]" 
              style={{ width: `${neutralPercentage}%` }}
            ></div>
            <div 
              className="bg-[#dc2f1c] rounded-r-full" 
              style={{ width: `${badPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {createPortal(tooltipContent, document.body)}
    </>
  );
}
