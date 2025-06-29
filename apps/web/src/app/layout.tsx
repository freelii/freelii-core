import { geistMono, inter, satoshi } from "@/styles/fonts";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { StellarProvider } from "@/contexts/stellar-context";
import { cn } from "@freelii/utils";
import { type Metadata } from "next";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Freelii",
  description: "Payments layer for AI Agents",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Freelii",
    description: "Payments layer for AI Agents",
    url: "https://freelii.app",
    siteName: "Freelii",
    images: [
      { url: "https://b4slusdeu7.ufs.sh/f/WtrbKSQbxOe7SGy2N5MRNZKja2pwYey3b5cUGO4J8HxgstCB" },
    ],
  },
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
        <StellarProvider>
          <TRPCReactProvider>
            <Toaster />
            {children}
          </TRPCReactProvider>
        </StellarProvider>
      </body>
    </html>
  );
}
