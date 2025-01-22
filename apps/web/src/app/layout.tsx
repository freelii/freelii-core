import "@/styles/globals.css";
import { geistMono, inter, satoshi } from "@/styles/fonts";
import { type Metadata } from "next";
import { cn } from "@freelii/utils";
import { TRPCReactProvider } from "@/trpc/react";

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
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
