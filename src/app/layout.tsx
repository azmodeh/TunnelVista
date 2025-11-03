import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./globals.css";
    import Sidebar from "@/components/layout/Sidebar";
    import { usePathname } from "next/navigation";

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
        &lt;html lang="fa" dir="rtl"&gt;
          &lt;body className={`${inter.className} dark bg-gray-900 text-white flex`}&gt;
              &lt;Sidebar /&gt;
              &lt;main className="flex-1 p-8"&gt;
                  {children}
              &lt;/main&gt;
          &lt;/body&gt;
        &lt;/html&gt;
      );
    }