import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configuração de imagens
  images: {
    // ✅ Removido 'domains' para eliminar o warning e proteger a aplicação
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wntiupkhjtgiaxiicxeq.supabase.co', // Seu host específico
        pathname: '/storage/v1/object/public/**', // Segurança adicional: permite apenas arquivos públicos
      },
    ],
  },

  // Suporte a experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
