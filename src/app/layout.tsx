import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProviDATA - Gestão de Providências Parlamentares",
  description: "Sistema completo para vereadores, deputados e senadores gerenciarem as solicitações dos cidadãos de forma organizada e transparente.",
  keywords: ["providências", "parlamentar", "vereador", "deputado", "senador", "gestão", "cidadão"],
  authors: [{ name: "DATA-RO INTELIGÊNCIA TERRITORIAL" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
