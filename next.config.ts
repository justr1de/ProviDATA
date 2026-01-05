import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configuração de imagens (Next.js 15/16)
  images: {
    // ✅ Formatos modernos para melhor compressão
    formats: ['image/avif', 'image/webp'],
    // ✅ Padrão seguro que substitui o 'domains' antigo
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wntiupkhjtgiaxiicxeq.supabase.co',
        pathname: '/storage/v1/object/public/**', // Restringe apenas aos arquivos públicos
      },
    ],
  },

  // Suporte a experimental features do Next.js 16
  experimental: {
    // Melhora a velocidade do build otimizando ícones e componentes
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
