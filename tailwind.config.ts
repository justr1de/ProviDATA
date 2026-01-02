import type { Config } from 'tailwindcss'

// Tailwind v4: sem este arquivo, o scanner de conteúdo pode não pegar arquivos em /src,
// resultando em CSS “quase sem utilitários” (ex.: faltando bg-white, text-gray-900 etc.).
const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
