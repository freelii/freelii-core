import "@/styles/globals.css";
import { geistMono, inter, satoshi } from "@/styles/fonts";
import { type Metadata } from "next";
import { cn } from "@freelii/utils";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast'

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
          <ClerkProvider>
            <TRPCReactProvider>
              <Toaster />
              {children}
            </TRPCReactProvider>
          </ClerkProvider>
      </body>
    </html>
  );
}
