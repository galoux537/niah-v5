import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "components": path.resolve(__dirname, "./components"),
      "lib": path.resolve(__dirname, "./src/lib"),
      "contexts": path.resolve(__dirname, "./contexts"),
      "styles": path.resolve(__dirname, "./styles"),
      "imports": path.resolve(__dirname, "./imports"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@radix-ui/react-aspect-ratio@1.1.2": "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar@1.1.3": "@radix-ui/react-avatar",
      "@radix-ui/react-slot@1.1.2": "@radix-ui/react-slot",
      "@radix-ui/react-checkbox@1.1.4": "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible@1.1.3": "@radix-ui/react-collapsible",
      "@radix-ui/react-hover-card@1.1.6": "@radix-ui/react-hover-card",
      "@radix-ui/react-menubar@1.1.6": "@radix-ui/react-menubar",
      "@radix-ui/react-popover@1.1.6": "@radix-ui/react-popover",
      "@radix-ui/react-radio-group@1.2.3": "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area@1.2.3": "@radix-ui/react-scroll-area",
      "@radix-ui/react-slider@1.2.3": "@radix-ui/react-slider",
      "@radix-ui/react-switch@1.1.3": "@radix-ui/react-switch",
      "@radix-ui/react-context-menu@2.2.6": "@radix-ui/react-context-menu",
      "@radix-ui/react-navigation-menu@1.2.5": "@radix-ui/react-navigation-menu",
      "@radix-ui/react-tabs@1.1.3": "@radix-ui/react-tabs",
      "@radix-ui/react-separator@1.1.2": "@radix-ui/react-separator",
      "@radix-ui/react-toggle-group@1.1.2": "@radix-ui/react-toggle-group",
      "@radix-ui/react-toggle@1.1.2": "@radix-ui/react-toggle",
      "@radix-ui/react-progress@1.1.2": "@radix-ui/react-progress",
      "@radix-ui/react-label@2.1.2": "@radix-ui/react-label",
      "lucide-react@0.487.0": "lucide-react",
      "embla-carousel-react@8.6.0": "embla-carousel-react",
      "class-variance-authority@0.7.1": "class-variance-authority",
      "recharts@2.15.2": "recharts",
      "cmdk@1.1.1": "cmdk",
      "react-hook-form@7.55.0": "react-hook-form",
      "input-otp@1.4.2": "input-otp",
      "react-resizable-panels@2.1.7": "react-resizable-panels",
      "vaul@1.1.2": "vaul",
      "react-day-picker@8.10.1": "react-day-picker",
      "sonner@2.0.3": "sonner",
      "next-themes@0.4.6": "next-themes"
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  build: {
    outDir: "dist",
    sourcemap: true
  },
  // Ensure environment variables are properly loaded
  envPrefix: 'VITE_',
  define: {
    // Fallback environment variables for development
    __SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://iyqrjgwqjmsnhtxbywme.supabase.co'),
    __SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA')
  }
})
