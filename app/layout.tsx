import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./globals.css";
    import Sidebar from "@/components/layout/Sidebar";

    const inter = Inter({ subsets: ["latin"] });

    export const metadata: Metadata = {
      title: "TunnelVista",
      description: "Secure, blazing-fast, invisible tunnel — one tap away",
    };

    export default function RootLayout({
      children,
    }: Readonly&lt;{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="en" className="dark">
          <body className={inter.className}>
            <div className="flex min-h-screen bg-gradient-to-br from-[#0A0F1E] to-[#16213E]">
              <Sidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </body>
        </html>
      );
    }