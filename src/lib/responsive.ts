import { useState, useEffect } from 'react';

// Breakpoints responsivos
export const BREAKPOINTS = {
  xs: 480,    // Extra small devices (phones)
  sm: 640,    // Small devices (large phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (laptops)
  xl: 1280,   // Extra large devices (desktops)
  '2xl': 1536 // 2X large devices (large desktops)
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Hook para detectar breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      let newBreakpoint: Breakpoint = 'lg';
      
      if (width < BREAKPOINTS.xs) {
        newBreakpoint = 'xs';
      } else if (width < BREAKPOINTS.sm) {
        newBreakpoint = 'sm';
      } else if (width < BREAKPOINTS.md) {
        newBreakpoint = 'md';
      } else if (width < BREAKPOINTS.lg) {
        newBreakpoint = 'lg';
      } else if (width < BREAKPOINTS.xl) {
        newBreakpoint = 'xl';
      } else {
        newBreakpoint = '2xl';
      }
      
      setBreakpoint(newBreakpoint);
      setIsMobile(width < BREAKPOINTS.md);
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
      setIsDesktop(width >= BREAKPOINTS.lg);
    };

    // Atualizar imediatamente
    updateBreakpoint();

    // Listener para mudanças de tamanho
    window.addEventListener('resize', updateBreakpoint);
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  };
}

// Hook para detectar orientação
export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const updateOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
      setIsLandscape(!isPortraitMode);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return { isPortrait, isLandscape };
}

// Hook combinado para responsividade
export function useResponsive() {
  const breakpoint = useBreakpoint();
  const orientation = useOrientation();

  return {
    ...breakpoint,
    ...orientation,
    // Utilitários para classes condicionais
    isSmallScreen: breakpoint.isMobile || breakpoint.isTablet,
    isLargeScreen: breakpoint.isDesktop,
    // Classes responsivas comuns
    responsiveClasses: {
      container: breakpoint.isMobile ? 'px-4' : breakpoint.isTablet ? 'px-6' : 'px-6',
      grid: breakpoint.isMobile ? 'grid-cols-1' : breakpoint.isTablet ? 'grid-cols-2' : 'grid-cols-3',
      text: breakpoint.isMobile ? 'text-sm' : 'text-base',
      spacing: breakpoint.isMobile ? 'gap-4' : 'gap-6'
    }
  };
} 