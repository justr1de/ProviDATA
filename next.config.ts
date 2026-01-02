import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configuração de imagens
  images: {
    domains: ['wntiupkhjtgiaxiicxeq.supabase.co'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Suporte a experimental features do Next.js 16
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
