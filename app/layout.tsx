"use client"

import { Urbanist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const urbanist = Urbanist({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();  
  
  const isLoginPage = pathname.includes("auth/login");  

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${urbanist.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {!isLoginPage && <Navbar />}  
          {!isLoginPage && <NextTopLoader />}  
          {children}
          <Toaster />
          {!isLoginPage && <Footer />}  
        </ThemeProvider>
      </body>
    </html>
  );
}
