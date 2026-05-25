import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TitanEdge — Trading Dashboard",
  description: "Premium futures trading bot dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-white min-h-screen">
        <Sidebar />
        <div className="md:ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 px-4 md:px-6 py-6 overflow-x-hidden">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
