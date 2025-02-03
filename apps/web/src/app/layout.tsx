import { geistMono, inter, satoshi } from "@/styles/fonts";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@freelii/utils";
import { type Metadata } from "next";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Freelii",
  description: "Smart Business Bank Account",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        satoshi.variable,
        inter.variable,
        geistMono.variable,
      )}
    >
      <body>
        <TRPCReactProvider>
          <Toaster />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
