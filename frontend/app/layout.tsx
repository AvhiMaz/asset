import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import AppWalletProvider from "@/components/AppWalletProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "timeloop vault | lock assets in time",
  description:
    "lock digital assets on solana and schedule their delivery to a recipient at a future date.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} lowercase`}>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
        <Toaster />
      </body>
    </html>
  );
}
